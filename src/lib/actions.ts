import { createHash } from "node:crypto";
import { Prisma, type Role } from "@prisma/client";
import { z } from "zod";
import { atomic, audit, transfer, journal } from "./finance";
import { ensure, allocate, purchaseGuard } from "./domain";
import { schemas, type ActionName } from "./validation";
import { scoreProject, type Signals } from "./scoring";
import { serialize } from "./utils";

export async function execute(
  actorId: string,
  action: string,
  input: unknown,
  key: string,
) {
  ensure(Object.hasOwn(schemas, action), "Aksi tidak tersedia.");
  ensure(
    typeof key === "string" && key.length >= 8 && key.length <= 100,
    "Kunci permintaan tidak valid.",
  );
  const parsed = schemas[action as ActionName].safeParse(input);
  ensure(
    parsed.success,
    parsed.error?.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(" ") ?? "Data tidak valid.",
  );
  const fingerprint = createHash("sha256")
    .update(JSON.stringify(parsed.data))
    .digest("hex");
  function data<K extends ActionName>(name: K): z.output<(typeof schemas)[K]> {
    return schemas[name].parse(input) as z.output<(typeof schemas)[K]>;
  }
  return atomic(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: actorId } });
    const roles = (...allowed: Role[]) =>
      ensure(
        allowed.includes(user.role),
        "Anda tidak memiliki akses untuk tindakan ini.",
        403,
      );
    const previous = await tx.requestKey.findUnique({
      where: { actorId_action_key: { actorId, action, key } },
    });
    if (previous) {
      ensure(
        previous.fingerprint === fingerprint,
        "Kunci permintaan sudah dipakai untuk data berbeda.",
        409,
      );
      return previous.result as { message: string; id?: string };
    }
    let message = "Perubahan berhasil disimpan.";
    let resultId: string | undefined;
    const wallet = async (userId: string) =>
      tx.account.findUniqueOrThrow({ where: { userId } });
    const clearing = async () =>
      tx.account.findUniqueOrThrow({ where: { key: "clearing" } });
    switch (action) {
      case "wallet.topup": {
        roles("INVESTOR");
        const d = data(action);
        ensure(!user.locked, "Self-Lock aktif. Verifikasi ulang untuk top-up.");
        ensure(user.verified, "Verifikasi identitas diperlukan.");
        ensure(
          !d.simulateFailure,
          "Simulasi pembayaran gagal. Matikan simulasi gagal, lalu coba ulang.",
        );
        await transfer(
          tx,
          actorId,
          `topup:${actorId}:${key}`,
          "TOPUP",
          actorId,
          (await clearing()).id,
          (await wallet(actorId)).id,
          BigInt(d.amount),
        );
        message = "Saldo simulasi berhasil ditambahkan.";
        break;
      }
      case "security.lock": {
        roles("INVESTOR");
        const d = data(action);
        ensure(
          d.locked || d.code === "123456",
          "Kode verifikasi demo harus 123456.",
        );
        await tx.user.update({
          where: { id: actorId },
          data: { locked: d.locked },
        });
        message = d.locked
          ? "Self-Lock aktif. Transaksi diblokir."
          : "Verifikasi ulang berhasil. Akun terbuka.";
        break;
      }
      case "kyc.submit": {
        roles("INVESTOR", "NELAYAN");
        const d = data(action);
        ensure(!user.verified, "Akun sudah terverifikasi.");
        ensure(
          user.role !== "NELAYAN" || d.kusuka?.startsWith("DEMO-"),
          "Gunakan nomor KUSUKA fiktif dengan awalan DEMO-.",
        );
        const document = await tx.document.findFirst({
          where: { ownerId: actorId, kind: "KYC" },
        });
        ensure(document, "Unggah dokumen identitas fiktif terlebih dahulu.");
        await tx.user.update({
          where: { id: actorId },
          data: { name: d.name, location: d.location, kusuka: d.kusuka },
        });
        await tx.kycCase.upsert({
          where: { userId: actorId },
          create: {
            userId: actorId,
            status: "DIAJUKAN",
            liveness: "LULUS_DEMO",
            mfa: true,
          },
          update: {
            status: "DIAJUKAN",
            liveness: "LULUS_DEMO",
            mfa: true,
            reason: null,
          },
        });
        message = "Verifikasi demo dikirim. Tunggu tinjauan admin.";
        break;
      }
      case "kyc.review": {
        roles("ADMIN");
        const d = data(action);
        const kyc = await tx.kycCase.findUniqueOrThrow({ where: { id: d.id } });
        ensure(kyc.status === "DIAJUKAN", "Berkas tidak sedang diajukan.");
        if (d.approve) {
          const proof = await tx.document.findFirst({
            where: { ownerId: kyc.userId, kind: "KYC" },
          });
          ensure(
            proof && kyc.mfa && kyc.liveness === "LULUS_DEMO",
            "Bukti identitas, MFA, dan liveness demo harus lengkap.",
          );
        }
        await tx.kycCase.update({
          where: { id: d.id },
          data: {
            status: d.approve ? "TERVERIFIKASI" : "PERLU_PERBAIKAN",
            reason: d.reason,
            reviewedBy: actorId,
          },
        });
        await tx.user.update({
          where: { id: kyc.userId },
          data: { verified: d.approve },
        });
        break;
      }
      case "project.save": {
        roles("NELAYAN");
        const d = data(action);
        const membership = await tx.membership.findUnique({
          where: {
            userId_cooperativeId: {
              userId: actorId,
              cooperativeId: d.cooperativeId,
            },
          },
          include: { cooperative: true },
        });
        ensure(
          membership?.active && membership.cooperative.active,
          "Keanggotaan koperasi harus aktif.",
        );
        const fields = {
          title: d.title,
          category: d.category,
          location: d.location,
          cooperativeId: d.cooperativeId,
          requested: BigInt(d.requested),
          plan: d.plan,
          signals: d.signals,
        };
        if (d.id) {
          const p = await tx.project.findUniqueOrThrow({ where: { id: d.id } });
          ensure(p.ownerId === actorId, "Proyek ini bukan milik Anda.", 403);
          ensure(
            ["DRAF", "PERLU_REVISI", "PERLU_PEMBINAAN"].includes(p.status),
            "Proyek tidak dapat diubah saat ini.",
          );
          resultId = (
            await tx.project.update({ where: { id: d.id }, data: fields })
          ).id;
        } else
          resultId = (
            await tx.project.create({ data: { ...fields, ownerId: actorId } })
          ).id;
        message = "Draf proyek tersimpan. Lengkapi dokumen, lalu ajukan.";
        break;
      }
      case "project.submit": {
        roles("NELAYAN");
        const d = data(action);
        const p = await tx.project.findUniqueOrThrow({
          where: { id: d.id },
          include: { documents: true },
        });
        ensure(p.ownerId === actorId, "Proyek ini bukan milik Anda.", 403);
        ensure(user.verified, "Akun nelayan belum terverifikasi.");
        ensure(
          ["DRAF", "PERLU_REVISI", "PERLU_PEMBINAAN"].includes(p.status),
          "Proyek sudah diajukan.",
        );
        const membership = await tx.membership.findUnique({
          where: {
            userId_cooperativeId: {
              userId: actorId,
              cooperativeId: p.cooperativeId,
            },
          },
          include: { cooperative: true },
        });
        ensure(
          membership?.active && membership.cooperative.active,
          "Keanggotaan koperasi tidak aktif.",
        );
        ensure(
          p.documents.length > 0,
          "Unggah minimal satu dokumen rencana usaha.",
        );
        const signals = p.signals as Signals;
        const scored = scoreProject(signals);
        await tx.scoreRun.create({
          data: {
            projectId: p.id,
            ...scored,
            signals: signals as Prisma.InputJsonValue,
          },
        });
        await tx.project.update({
          where: { id: p.id },
          data: { status: "DIAJUKAN", reason: null },
        });
        message = "Proyek diajukan dan skor demo berhasil dihitung.";
        break;
      }
      case "project.review": {
        roles("ADMIN");
        const d = data(action);
        const p = await tx.project.findUniqueOrThrow({
          where: { id: d.id },
          include: { scores: { orderBy: { createdAt: "desc" }, take: 1 } },
        });
        ensure(
          ["DIAJUKAN", "DITINJAU"].includes(p.status),
          "Proyek tidak berada dalam antrean tinjauan.",
        );
        const s = p.scores[0];
        if (d.decision === "DISETUJUI")
          ensure(
            s && !s.provisional && s.score !== null && s.score >= 50,
            "Skor sementara atau di bawah 50 tidak dapat disetujui.",
          );
        await tx.project.update({
          where: { id: p.id },
          data: { status: d.decision, reason: d.reason },
        });
        break;
      }
      case "offering.propose": {
        roles("ADMIN");
        const d = data(action);
        const p = await tx.project.findUniqueOrThrow({
          where: { id: d.projectId },
        });
        ensure(p.status === "DISETUJUI", "Proyek belum disetujui.");
        ensure(
          BigInt(d.target) === p.requested && d.target % d.unitPrice === 0,
          "Target harus sama dengan modal proyek dan kelipatan harga unit.",
        );
        const offer = await tx.offering.create({
          data: {
            projectId: p.id,
            slug: `${p.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .slice(0, 60)}-${p.id.slice(-6)}`,
            target: BigInt(d.target),
            unitPrice: BigInt(d.unitPrice),
            opensAt: new Date(),
            closesAt: new Date(Date.now() + d.days * 86400000),
            prospectuses: {
              create: {
                version: 1,
                risk: d.risk,
                proceeds: d.proceeds,
                content:
                  "Efek syariah simulasi diterbitkan koperasi. Porsi koperasi 60% laba, nelayan 40%. Sebanyak 80% porsi laba koperasi dialokasikan pro-rata kepada investor; sisanya untuk koperasi. Sisa pembulatan rupiah diberikan menurut urutan ID pesanan. Laba nol tidak membagikan hasil. Kerugian ditinjau manual. Pokok tidak dikembalikan oleh fitur distribusi laba. Tidak ada imbal hasil yang dijamin.",
              },
            },
          },
        });
        await tx.account.create({
          data: {
            key: `escrow:${offer.id}`,
            kind: "OFFERING_ESCROW",
            offeringId: offer.id,
          },
        });
        await tx.agreement.create({
          data: {
            offeringId: offer.id,
            stages: {
              create: [
                {
                  number: 1,
                  title: "Persiapan & sarana",
                  amount: (BigInt(d.target) * 60n) / 100n,
                },
                {
                  number: 2,
                  title: "Operasional usaha",
                  amount: BigInt(d.target) - (BigInt(d.target) * 60n) / 100n,
                },
              ],
            },
          },
        });
        resultId = offer.id;
        message = "Draf penawaran siap ditinjau dan diterbitkan admin.";
        break;
      }
      case "offering.publish": {
        roles("ADMIN");
        const d = data(action);
        const o = await tx.offering.findUniqueOrThrow({
          where: { id: d.id },
          include: {
            project: {
              include: {
                owner: true,
                cooperative: true,
                scores: { orderBy: { createdAt: "desc" }, take: 1 },
              },
            },
            prospectuses: true,
          },
        });
        const s = o.project.scores[0];
        const m = await tx.membership.findUnique({
          where: {
            userId_cooperativeId: {
              userId: o.project.ownerId,
              cooperativeId: o.project.cooperativeId,
            },
          },
        });
        ensure(
          o.status === "DRAF" && o.project.status === "DISETUJUI",
          "Penawaran belum siap atau sudah diterbitkan.",
        );
        ensure(
          s &&
            !s.provisional &&
            s.score !== null &&
            s.score >= 50 &&
            m?.active &&
            o.project.owner.verified &&
            o.project.cooperative.active,
          "Skor, identitas, atau keanggotaan tidak memenuhi syarat.",
        );
        ensure(
          o.closesAt > new Date() &&
            o.prospectuses.some((p) => p.version === o.activeVersion),
          "Periode atau prospektus tidak valid.",
        );
        await tx.offering.update({
          where: { id: o.id },
          data: { status: "AKTIF", publishedAt: new Date() },
        });
        message = "Penawaran terbit di marketplace investor.";
        break;
      }
      case "offering.buy": {
        roles("INVESTOR");
        const d = data(action);
        const o = await tx.offering.findUniqueOrThrow({
          where: { id: d.id },
          include: { escrow: true, prospectuses: true },
        });
        const w = await wallet(actorId);
        const amount = BigInt(d.amount);
        purchaseGuard({
          amount,
          unit: o.unitPrice,
          balance: w.balance,
          remaining: o.target - o.raised,
          locked: user.locked,
          verified: user.verified,
          active:
            o.status === "AKTIF" &&
            !!o.publishedAt &&
            o.opensAt <= new Date() &&
            o.closesAt > new Date(),
        });
        const prospectus = o.prospectuses.find(
          (p) => p.id === d.prospectusId && p.version === o.activeVersion,
        );
        ensure(
          prospectus,
          "Prospektus berubah. Muat ulang dan setujui versi aktif.",
        );
        ensure(
          !d.simulateFailure,
          "Simulasi pembayaran gagal; tidak ada saldo yang dipotong.",
        );
        const order = await tx.subscription.create({
          data: {
            investorId: actorId,
            offeringId: o.id,
            prospectusId: prospectus.id,
            amount,
            unitPrice: o.unitPrice,
            units: Number(amount / o.unitPrice),
            requestKey: key,
          },
        });
        await transfer(
          tx,
          actorId,
          `purchase:${order.id}`,
          "PEMBELIAN",
          order.id,
          w.id,
          o.escrow!.id,
          amount,
        );
        await tx.offering.update({
          where: { id: o.id },
          data: {
            raised: { increment: amount },
            status: o.raised + amount === o.target ? "SUKSES" : "AKTIF",
          },
        });
        resultId = order.id;
        message = "Pembelian berhasil. Dana tercatat di escrow simulasi.";
        break;
      }
      case "offering.expire": {
        roles("ADMIN");
        const d = data(action);
        ensure(
          process.env.DEMO_MODE === "true",
          "Perintah waktu simulasi dinonaktifkan.",
        );
        const o = await tx.offering.findUniqueOrThrow({
          where: { id: d.id },
          include: {
            escrow: true,
            orders: { where: { status: "TERKONFIRMASI" } },
          },
        });
        if (o.status === "GAGAL") {
          message = "Refund sudah diproses.";
          break;
        }
        ensure(
          o.status === "AKTIF" && o.raised < o.target,
          "Hanya penawaran aktif yang belum penuh dapat diakhiri.",
        );
        await tx.offering.update({
          where: { id: o.id },
          data: { status: "GAGAL", closesAt: new Date() },
        });
        for (const order of o.orders) {
          await transfer(
            tx,
            actorId,
            `refund:${order.id}`,
            "REFUND",
            order.id,
            o.escrow!.id,
            (await wallet(order.investorId)).id,
            order.amount,
          );
          await tx.subscription.update({
            where: { id: order.id },
            data: { status: "DIKEMBALIKAN" },
          });
        }
        message =
          "Periode demo diakhiri. Semua pesanan dikembalikan tepat satu kali.";
        break;
      }
      case "offering.release": {
        roles("ADMIN");
        const d = data(action);
        const o = await tx.offering.findUniqueOrThrow({
          where: { id: d.id },
          include: { escrow: true, project: true },
        });
        ensure(o.status === "SUKSES", "Target penawaran belum tercapai.");
        if (o.releasedAt) {
          message = "Escrow sudah dilepas sebelumnya.";
          break;
        }
        const coop = await tx.account.findUniqueOrThrow({
          where: { cooperativeId: o.project.cooperativeId },
        });
        await transfer(
          tx,
          actorId,
          `issuer_release:${o.id}`,
          "PELEPASAN_ESCROW",
          o.id,
          o.escrow!.id,
          coop.id,
          o.target,
        );
        await tx.offering.update({
          where: { id: o.id },
          data: { releasedAt: new Date() },
        });
        message = "Dana escrow diterima dompet koperasi.";
        break;
      }
      case "agreement.sign": {
        roles("NELAYAN", "ADMIN");
        const d = data(action);
        const a = await tx.agreement.findUniqueOrThrow({
          where: { id: d.id },
          include: { offering: { include: { project: true } } },
        });
        ensure(
          user.role === "ADMIN" || a.offering.project.ownerId === actorId,
          "Akad berada di luar akses Anda.",
          403,
        );
        ensure(a.offering.publishedAt, "Penawaran belum diterbitkan.");
        const fisherSignedAt =
          user.role === "NELAYAN"
            ? (a.fisherSignedAt ?? new Date())
            : a.fisherSignedAt;
        const coopSignedAt =
          user.role === "ADMIN"
            ? (a.coopSignedAt ?? new Date())
            : a.coopSignedAt;
        await tx.agreement.update({
          where: { id: a.id },
          data: {
            fisherSignedAt,
            coopSignedAt,
            status: fisherSignedAt && coopSignedAt ? "AKTIF" : "DRAF",
          },
        });
        message = "Persetujuan akad mudharabah tersimpan.";
        break;
      }
      case "stage.approve":
      case "stage.pay": {
        roles("ADMIN");
        const d =
          action === "stage.approve"
            ? data("stage.approve")
            : data("stage.pay");
        const stage = await tx.stage.findUniqueOrThrow({
          where: { id: d.id },
          include: {
            agreement: {
              include: {
                stages: true,
                offering: {
                  include: { project: { include: { reports: true } } },
                },
              },
            },
          },
        });
        const a = stage.agreement;
        const o = a.offering;
        ensure(
          a.status === "AKTIF" && o.status === "SUKSES" && o.releasedAt,
          "Akad harus aktif dan escrow sudah dilepas.",
        );
        if (stage.status === "DICAIRKAN") {
          message = "Tahap sudah dicairkan.";
          break;
        }
        ensure(
          a.stages
            .filter((s) => s.number < stage.number)
            .every((s) => s.status === "DICAIRKAN"),
          "Cairkan tahap sebelumnya terlebih dahulu.",
        );
        ensure(
          stage.number === 1 ||
            o.project.reports.some((r) => r.status === "VALID"),
          "Tahap lanjutan memerlukan laporan valid.",
        );
        ensure(
          a.stages.reduce((n, s) => n + s.amount, 0n) <= o.target,
          "Jumlah tahap melebihi pagu akad.",
        );
        if (action === "stage.approve") {
          await tx.stage.update({
            where: { id: stage.id },
            data: { status: "DISETUJUI" },
          });
          break;
        }
        ensure(stage.status === "DISETUJUI", "Tahap belum disetujui.");
        const coop = await tx.account.findUniqueOrThrow({
          where: { cooperativeId: o.project.cooperativeId },
        });
        await transfer(
          tx,
          actorId,
          `stage:${stage.id}`,
          "PENCAIRAN",
          stage.id,
          coop.id,
          (await wallet(o.project.ownerId)).id,
          stage.amount,
        );
        await tx.stage.update({
          where: { id: stage.id },
          data: { status: "DICAIRKAN", paidAt: new Date() },
        });
        await tx.project.update({
          where: { id: o.projectId },
          data: { status: "BERJALAN" },
        });
        message = "Dana tahap diterima di Dompetku nelayan.";
        break;
      }
      case "report.submit": {
        roles("NELAYAN");
        const d = data(action);
        const p = await tx.project.findUniqueOrThrow({
          where: { id: d.projectId },
          include: {
            offering: { include: { agreement: { include: { stages: true } } } },
          },
        });
        ensure(p.ownerId === actorId, "Proyek ini bukan milik Anda.", 403);
        ensure(
          p.status === "BERJALAN",
          "Laporan tersedia setelah proyek berjalan.",
        );
        const paid =
          p.offering?.agreement?.stages
            .filter((s) => s.status === "DICAIRKAN")
            .reduce((n, s) => n + s.amount, 0n) ?? 0n;
        ensure(
          BigInt(d.used) <= paid,
          "Penggunaan dana melebihi dana yang dicairkan.",
        );
        const existing = await tx.report.findUnique({
          where: { projectId_period: { projectId: p.id, period: d.period } },
        });
        ensure(
          !existing || existing.status === "PERLU_REVISI",
          "Laporan periode ini sudah diajukan.",
        );
        const fields = {
          progress: d.progress,
          used: BigInt(d.used),
          result: BigInt(d.result),
          note: d.note,
          status: "DIAJUKAN",
          reason: null,
        };
        resultId = (
          await tx.report.upsert({
            where: { projectId_period: { projectId: p.id, period: d.period } },
            create: { projectId: p.id, period: d.period, ...fields },
            update: fields,
          })
        ).id;
        message =
          "Laporan dikirim untuk validasi admin. Tambahkan bukti laporan.";
        break;
      }
      case "report.review": {
        roles("ADMIN");
        const d = data(action);
        const r = await tx.report.findUniqueOrThrow({
          where: { id: d.id },
          include: { documents: true },
        });
        ensure(r.status === "DIAJUKAN", "Laporan tidak berada dalam antrean.");
        if (d.approve)
          ensure(r.documents.length > 0, "Laporan memerlukan bukti dokumen.");
        await tx.report.update({
          where: { id: r.id },
          data: {
            status: d.approve
              ? r.result < 0n
                ? "TINJAUAN_MANUAL"
                : "VALID"
              : "PERLU_REVISI",
            reason: d.reason,
          },
        });
        message =
          r.result < 0n && d.approve
            ? "Kerugian masuk tinjauan manual; dana tidak dibagikan."
            : "Keputusan laporan tersimpan.";
        break;
      }
      case "report.distribute": {
        roles("ADMIN");
        const d = data(action);
        const r = await tx.report.findUniqueOrThrow({
          where: { id: d.id },
          include: {
            project: {
              include: {
                offering: {
                  include: {
                    agreement: true,
                    orders: { where: { status: "TERKONFIRMASI" } },
                    prospectuses: true,
                  },
                },
              },
            },
          },
        });
        const o = r.project.offering;
        const a = o?.agreement;
        ensure(
          r.status === "VALID" &&
            r.result >= 0n &&
            a?.status === "AKTIF" &&
            o?.status === "SUKSES",
          "Hanya laba laporan valid dengan akad aktif yang dapat didistribusikan.",
        );
        const already = await tx.distribution.findUnique({
          where: {
            agreementId_reportId_type: {
              agreementId: a.id,
              reportId: r.id,
              type: "MUDHARABAH",
            },
          },
        });
        if (already) {
          message = "Hasil periode ini sudah dibagikan.";
          break;
        }
        const coop = await tx.account.findUniqueOrThrow({
          where: { cooperativeId: r.project.cooperativeId },
        });
        const fisher = await wallet(r.project.ownerId);
        const coopAmount = (r.result * BigInt(a.coopBps)) / 10000n;
        const fisherAmount = r.result - coopAmount;
        const prospectus = o.prospectuses.find(
          (p) => p.version === o.activeVersion,
        )!;
        const payout = (coopAmount * BigInt(prospectus.payoutBps)) / 10000n;
        if (r.result > 0n) {
          await journal(
            tx,
            actorId,
            `profit:${a.id}:${r.id}`,
            "LABA_MUDHARABAH",
            r.id,
            [
              { accountId: (await clearing()).id, amount: -r.result },
              ...[
                { accountId: coop.id, amount: coopAmount },
                { accountId: fisher.id, amount: fisherAmount },
              ].filter((l) => l.amount > 0n),
            ],
          );
        }
        const lines = allocate(payout, o.orders);
        if (payout > 0n) {
          const entries = [{ accountId: coop.id, amount: -payout }];
          for (const line of lines)
            if (line.payout > 0n)
              entries.push({
                accountId: (
                  await wallet(
                    o.orders.find((x) => x.id === line.id)!.investorId,
                  )
                ).id,
                amount: line.payout,
              });
          await journal(
            tx,
            actorId,
            `payout:${a.id}:${r.id}`,
            "HASIL_INVESTOR",
            r.id,
            entries,
          );
        }
        await tx.distribution.create({
          data: {
            agreementId: a.id,
            reportId: r.id,
            type: "MUDHARABAH",
            amount: r.result,
            details: {
              coop: coopAmount.toString(),
              fisher: fisherAmount.toString(),
              rules: "60:40 demo",
            },
          },
        });
        await tx.distribution.create({
          data: {
            agreementId: a.id,
            reportId: r.id,
            type: "SECURITY_PAYOUT",
            amount: payout,
            details: serialize({
              lines,
              prospectusId: prospectus.id,
              rule: "80% dari porsi laba koperasi, pro-rata; sisa rupiah menurut ID pesanan",
            }) as unknown as Prisma.InputJsonValue,
          },
        });
        message =
          "Laba dibagi menurut akad dan hak investor pada prospektus demo.";
        break;
      }
      case "alert.assign":
      case "alert.resolve": {
        roles("ADMIN");
        const d =
          action === "alert.resolve"
            ? data("alert.resolve")
            : data("alert.assign");
        await tx.securityAlert.update({
          where: { id: d.id },
          data: {
            assignedTo: actorId,
            ...("reason" in d
              ? { status: "SELESAI", note: String(d.reason) }
              : { status: "DITANGANI" }),
          },
        });
        break;
      }
      case "assignment.create": {
        roles("ADMIN");
        const d = data(action);
        const f = await tx.user.findUniqueOrThrow({
          where: { id: d.facilitatorId },
        });
        const n = await tx.user.findUniqueOrThrow({
          where: { id: d.fisherId },
        });
        ensure(
          f.role === "ADMIN" && n.role === "NELAYAN",
          "Peran penugasan tidak sesuai.",
        );
        await tx.assignment.upsert({
          where: { facilitatorId_fisherId: d },
          create: d,
          update: { active: true },
        });
        break;
      }
      case "assignment.note": {
        roles("ADMIN");
        const d = data(action);
        const a = await tx.assignment.findUniqueOrThrow({
          where: { id: d.id },
        });
        ensure(
          a.active && a.facilitatorId === actorId,
          "Nelayan tidak ditugaskan kepada Anda.",
          403,
        );
        await tx.facilitatorNote.create({
          data: { assignmentId: a.id, body: d.body },
        });
        message = "Catatan pendampingan tersimpan dan dapat dibaca nelayan.";
        break;
      }
    }
    const reason =
      parsed.data && "reason" in parsed.data
        ? String(parsed.data.reason)
        : message;
    const entityId =
      resultId ??
      (parsed.data && "id" in parsed.data ? String(parsed.data.id) : actorId);
    await audit(tx, actorId, action, entityId, reason);
    const result = { message, ...(resultId ? { id: resultId } : {}) };
    await tx.requestKey.create({
      data: { actorId, action, key, fingerprint, result },
    });
    return result;
  });
}
