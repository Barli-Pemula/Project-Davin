import "dotenv/config";
import { hash } from "bcryptjs";
import { db } from "../src/lib/db";
import { atomic, transfer, audit } from "../src/lib/finance";
import { scoreProject, type Signals } from "../src/lib/scoring";
import type { Role } from "@prisma/client";

async function main() {
  if (process.env.DEMO_MODE !== "true")
    throw new Error("Seed hanya tersedia jika DEMO_MODE=true.");
  const passwordHash = await hash(
    process.env.DEMO_PASSWORD || "ArtaDemo!2026",
    12,
  );
  await atomic(async (tx) => {
    const coop = await tx.cooperative.upsert({
      where: { registration: "DEMO-KOP-001" },
      create: {
        id: "coop-bahari",
        name: "Koperasi Bahari Sejahtera",
        registration: "DEMO-KOP-001",
      },
      update: {},
    });
    const clearing = await tx.account.upsert({
      where: { key: "clearing" },
      create: { key: "clearing", kind: "DEMO_CLEARING" },
      update: {},
    });
    const coopWallet = await tx.account.upsert({
      where: { key: "coop:bahari" },
      create: {
        key: "coop:bahari",
        kind: "COOP_WALLET",
        cooperativeId: coop.id,
      },
      update: {},
    });
    const users: {
      id: string;
      name: string;
      role: Role;
      email: string;
      verified: boolean;
    }[] = [
      {
        id: "investor-demo",
        name: "Dedi Saputra",
        role: "INVESTOR",
        email: "investor@artanaya.demo",
        verified: true,
      },
      {
        id: "nelayan-demo",
        name: "Budi Santoso",
        role: "NELAYAN",
        email: "nelayan@artanaya.demo",
        verified: true,
      },
      {
        id: "admin-demo",
        name: "Nadia Prameswari",
        role: "ADMIN",
        email: "admin@artanaya.demo",
        verified: true,
      },
      {
        id: "koperasi-demo",
        name: "Ratna Wulandari",
        role: "KOPERASI",
        email: "koperasi@artanaya.demo",
        verified: true,
      },
      {
        id: "fasilitator-demo",
        name: "Rizky Pratama",
        role: "FASILITATOR",
        email: "fasilitator@artanaya.demo",
        verified: true,
      },
      {
        id: "nelayan-baru",
        name: "Sari Puspita",
        role: "NELAYAN",
        email: "baru@artanaya.demo",
        verified: true,
      },
      {
        id: "investor-review",
        name: "Ayu Lestari",
        role: "INVESTOR",
        email: "ayu@artanaya.demo",
        verified: false,
      },
    ];
    for (const u of users) {
      await tx.user.upsert({
        where: { email: u.email },
        create: {
          ...u,
          passwordHash,
          cooperativeId: u.role === "KOPERASI" ? coop.id : null,
          kusuka: u.role === "NELAYAN" ? "DEMO-****-2045" : null,
        },
        update: {},
      });
      await tx.account.upsert({
        where: { key: `wallet:${u.id}` },
        create: { key: `wallet:${u.id}`, kind: "USER_WALLET", userId: u.id },
        update: {},
      });
      await tx.kycCase.upsert({
        where: { userId: u.id },
        create: {
          userId: u.id,
          status: u.verified ? "TERVERIFIKASI" : "DIAJUKAN",
          liveness: "LULUS_DEMO",
          mfa: true,
        },
        update: {},
      });
      if (u.role === "NELAYAN")
        await tx.membership.upsert({
          where: {
            userId_cooperativeId: { userId: u.id, cooperativeId: coop.id },
          },
          create: { userId: u.id, cooperativeId: coop.id },
          update: {},
        });
    }
    const kycProof = Buffer.from(
      "IDENTITAS FIKTIF ARTANAYA. Dokumen seed untuk verifikasi demo Ayu Lestari.",
    );
    if (
      !(await tx.document.findFirst({
        where: { ownerId: "investor-review", kind: "KYC" },
      }))
    )
      await tx.document.create({
        data: {
          ownerId: "investor-review",
          kind: "KYC",
          name: "identitas-fiktif-demo.txt",
          mime: "text/plain",
          bytes: kycProof,
          size: kycProof.length,
        },
      });
    const investorWallet = await tx.account.findUniqueOrThrow({
      where: { userId: "investor-demo" },
    });
    await transfer(
      tx,
      null,
      "seed:investor-balance:v1",
      "TOPUP",
      "seed-demo",
      clearing.id,
      investorWallet.id,
      25000000n,
    );
    const seeds = [
      {
        id: "segara",
        title: "Budidaya Rumput Laut Segara",
        category: "BUDIDAYA",
        location: "Karimunjawa, Jawa Tengah",
        target: 20000000n,
        raised: 13500000n,
        status: "AKTIF",
        ownerId: "nelayan-demo",
        signals: { T: 80, P: 85, K: 90, L: 100, R: 70 },
      },
      {
        id: "tunas-laut",
        title: "Peremajaan Kapal Tunas Laut",
        category: "TANGKAP",
        location: "Paciran, Jawa Timur",
        target: 15000000n,
        raised: 500000n,
        status: "AKTIF",
        ownerId: "nelayan-demo",
        signals: { T: 70, P: 75, K: 85, L: 100, R: 65 },
      },
      {
        id: "mutiara",
        title: "Tambak Bandeng Mutiara Pesisir",
        category: "BUDIDAYA",
        location: "Demak, Jawa Tengah",
        target: 3000000n,
        raised: 3000000n,
        status: "SUKSES",
        ownerId: "nelayan-demo",
        signals: { T: 75, P: 80, K: 100, L: 100, R: 80 },
      },
      {
        id: "nelayan-baru-segara",
        title: "Budidaya Kerapu Harapan Baru",
        category: "BUDIDAYA",
        location: "Jepara, Jawa Tengah",
        target: 5000000n,
        raised: 0n,
        status: "DIAJUKAN",
        ownerId: "nelayan-baru",
        signals: { T: 65, P: 75, K: 90, L: 100, R: null },
      },
      {
        id: "revisi-jaring",
        title: "Jaring Ramah Laut Nusantara",
        category: "TANGKAP",
        location: "Karimunjawa, Jawa Tengah",
        target: 2000000n,
        raised: 0n,
        status: "PERLU_REVISI",
        ownerId: "nelayan-demo",
        signals: { T: 60, P: 55, K: 85, L: 100, R: 50 },
      },
    ];
    for (const s of seeds) {
      if (await tx.project.findUnique({ where: { id: s.id } })) continue;
      const hasOffer = ["AKTIF", "SUKSES"].includes(s.status);
      const p = await tx.project.create({
        data: {
          id: s.id,
          ownerId: s.ownerId,
          cooperativeId: coop.id,
          title: s.title,
          category: s.category,
          location: s.location,
          requested: s.target,
          plan: "Pengadaan sarana usaha, bibit atau peralatan ramah lingkungan, serta pendampingan anggota koperasi. Tahap pertama 60% untuk persiapan; tahap kedua 40% untuk operasional setelah laporan divalidasi.",
          signals: s.signals,
          status:
            s.status === "SUKSES"
              ? "BERJALAN"
              : hasOffer
                ? "DISETUJUI"
                : s.status,
          reason:
            s.status === "PERLU_REVISI"
              ? "Lengkapi rincian harga jaring dan jadwal operasional sebelum mengajukan ulang."
              : null,
        },
      });
      await tx.scoreRun.create({
        data: {
          projectId: p.id,
          signals: s.signals,
          ...scoreProject(s.signals as Signals),
        },
      });
      const content = Buffer.from(
        "DOKUMEN FIKTIF ARTANAYA\nRencana usaha dan bukti koperasi untuk demonstrasi. Tidak memuat identitas nyata.",
      );
      await tx.document.create({
        data: {
          ownerId: s.ownerId,
          projectId: p.id,
          kind: "PROJECT",
          name: "rencana-usaha-demo.txt",
          mime: "text/plain",
          bytes: content,
          size: content.length,
        },
      });
      if (!hasOffer) continue;
      const o = await tx.offering.create({
        data: {
          id: `offer-${s.id}`,
          slug: s.id,
          projectId: p.id,
          target: s.target,
          raised: s.raised,
          status: s.status,
          publishedAt: new Date(),
          opensAt: new Date(Date.now() - 86400000 * 5),
          closesAt: new Date(
            Date.now() + 86400000 * (s.id === "tunas-laut" ? 3 : 25),
          ),
          releasedAt: s.status === "SUKSES" ? new Date() : null,
          scenarioBps: s.id === "segara" ? 1200 : 1000,
        },
      });
      const prospectus = await tx.prospectus.create({
        data: {
          offeringId: o.id,
          version: 1,
          risk: "Cuaca ekstrem, perubahan harga komoditas, penyakit budidaya, dan keterlambatan panen dapat memengaruhi hasil. Modal berisiko. Angka skenario bukan jaminan hasil.",
          proceeds:
            "60% persiapan sarana dan bibit; 40% operasional setelah laporan tervalidasi.",
          content:
            "Efek syariah simulasi diterbitkan Koperasi Bahari Sejahtera. Akad mudharabah terpisah dengan nelayan: koperasi 60%, nelayan 40% laba. Investor menerima 80% dari porsi laba koperasi, proporsional terhadap nominal pesanan. Sisa pembulatan dibagikan berdasarkan ID pesanan. Contoh laba Rp1.000.000: nelayan Rp400.000, investor bersama Rp480.000, koperasi tersisa Rp120.000. Laba nol: tidak ada distribusi. Rugi: tinjauan manual. Distribusi ini tidak mengembalikan pokok. Efek, saldo, identitas, dan pembayaran sepenuhnya fiktif.",
        },
      });
      const escrow = await tx.account.create({
        data: {
          key: `escrow:${o.id}`,
          kind: "OFFERING_ESCROW",
          offeringId: o.id,
        },
      });
      const order = await tx.subscription.create({
        data: {
          investorId: "investor-demo",
          offeringId: o.id,
          prospectusId: prospectus.id,
          amount: s.raised,
          unitPrice: 50000n,
          units: Number(s.raised / 50000n),
          requestKey: `seed:${s.id}`,
        },
      });
      await transfer(
        tx,
        null,
        `purchase:${order.id}`,
        "PEMBELIAN",
        order.id,
        investorWallet.id,
        escrow.id,
        s.raised,
      );
      const active = s.status === "SUKSES";
      const a = await tx.agreement.create({
        data: {
          offeringId: o.id,
          status: active ? "AKTIF" : "DRAF",
          fisherSignedAt: active ? new Date() : null,
          coopSignedAt: active ? new Date() : null,
          stages: {
            create: [
              {
                number: 1,
                title: "Persiapan & sarana",
                amount: (s.target * 60n) / 100n,
                status: active ? "DICAIRKAN" : "DIRENCANAKAN",
                paidAt: active ? new Date() : null,
              },
              {
                number: 2,
                title: "Operasional usaha",
                amount: (s.target * 40n) / 100n,
              },
            ],
          },
        },
        include: { stages: true },
      });
      if (active) {
        await transfer(
          tx,
          null,
          `issuer_release:${o.id}`,
          "PELEPASAN_ESCROW",
          o.id,
          escrow.id,
          coopWallet.id,
          s.target,
        );
        const stage = a.stages.find((x) => x.number === 1)!;
        const fw = await tx.account.findUniqueOrThrow({
          where: { userId: s.ownerId },
        });
        await transfer(
          tx,
          null,
          `stage:${stage.id}`,
          "PENCAIRAN",
          stage.id,
          coopWallet.id,
          fw.id,
          stage.amount,
        );
        const report = await tx.report.create({
          data: {
            projectId: p.id,
            period: "Panen demo 01",
            progress: 100,
            used: 1800000n,
            result: 1000000n,
            note: "Panen contoh selesai dengan laba bersih simulasi Rp1.000.000. Bukti penggunaan dana terlampir.",
            status: "VALID",
          },
        });
        await tx.document.create({
          data: {
            ownerId: s.ownerId,
            reportId: report.id,
            kind: "REPORT",
            name: "bukti-panen-demo.txt",
            mime: "text/plain",
            bytes: content,
            size: content.length,
          },
        });
      }
    }
    await tx.assignment.upsert({
      where: {
        facilitatorId_fisherId: {
          facilitatorId: "fasilitator-demo",
          fisherId: "nelayan-baru",
        },
      },
      create: {
        facilitatorId: "fasilitator-demo",
        fisherId: "nelayan-baru",
        notes: {
          create: {
            body: "Lengkapi pencatatan produksi mingguan. Empat sinyal utama sudah tersedia untuk penilaian nelayan baru.",
          },
        },
      },
      update: {},
    });
    for (const [id, type, severity] of [
      ["alert-geo", "Geofencing demo: lokasi login baru", "SEDANG"],
      ["alert-live", "Liveness demo: perlu pemeriksaan ulang", "RENDAH"],
    ])
      await tx.securityAlert.upsert({
        where: { id },
        create: { id, userId: "investor-demo", type, severity },
        update: {},
      });
    if (!(await tx.audit.findFirst({ where: { action: "seed.complete" } })))
      await audit(
        tx,
        null,
        "seed.complete",
        "demo",
        "Data fiktif dan saldo awal dipasang satu kali.",
      );
  });
  console.log(
    "Seed ARTANAYA selesai. Akun: investor / nelayan / admin / koperasi / fasilitator @artanaya.demo.",
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
