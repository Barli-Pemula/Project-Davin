import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../src/lib/db";
import { execute } from "../src/lib/actions";
import { DomainError } from "../src/lib/domain";
import type { Role } from "@prisma/client";

const runId = randomUUID().slice(0, 8);
const ids = Object.fromEntries(
  [
    "admin",
    "fisher",
    "other",
    "investor",
    "second",
    "coop",
    "wrongcoop",
    "facilitator",
    "wrongfacilitator",
  ].map((x) => [x, `${x}-${runId}`]),
);
const coopId = `coop-${runId}`,
  otherCoopId = `other-coop-${runId}`;
let checks = 0;
function check(condition: unknown, label: string) {
  assert.ok(condition, label);
  checks++;
  console.log(`PASS ${label}`);
}
async function rejected(fn: () => Promise<unknown>, text: string) {
  await assert.rejects(fn, (e) => e instanceof DomainError);
  checks++;
  console.log(`PASS ${text}`);
}
const act = (user: string, action: string, data: unknown, key = randomUUID()) =>
  execute(ids[user] ?? user, action, data, key);
const balance = async (user: string) =>
  (await db.account.findUniqueOrThrow({ where: { userId: ids[user] } }))
    .balance;
async function document(
  owner: string,
  context: string,
  kind: "PROJECT" | "REPORT",
) {
  return db.document.create({
    data: {
      ownerId: ids[owner],
      kind,
      name: "fixture.pdf",
      mime: "application/pdf",
      size: 10,
      bytes: Buffer.from("%PDF-demo!"),
      ...(kind === "PROJECT" ? { projectId: context } : { reportId: context }),
    },
  });
}
async function createProject(title: string, target = 100000) {
  return (
    await act("fisher", "project.save", {
      title,
      category: "BUDIDAYA",
      location: "Pesisir demo",
      cooperativeId: coopId,
      requested: target,
      plan: "Rencana usaha fiktif untuk menguji seluruh alur pengajuan sampai pembelian.",
      signals: { T: 70, P: 70, K: 70, L: 70, R: null },
    })
  ).id!;
}
async function propose(projectId: string, target: number) {
  return (
    await act("coop", "offering.propose", {
      projectId,
      target,
      unitPrice: 50000,
      days: 30,
      risk: "Risiko cuaca dan harga pasar. Hasil tidak dijamin.",
      proceeds: "Persiapan 60% dan operasional 40% setelah laporan divalidasi.",
    })
  ).id!;
}
async function main() {
  assert.ok(new URL(process.env.DATABASE_URL!).pathname.includes("_test"));
  await db.cooperative.createMany({
    data: [
      { id: coopId, name: "Koperasi uji", registration: coopId },
      { id: otherCoopId, name: "Koperasi lainnya", registration: otherCoopId },
    ],
  });
  const roleMap: Record<string, Role> = {
    admin: "ADMIN",
    fisher: "NELAYAN",
    other: "NELAYAN",
    investor: "INVESTOR",
    second: "INVESTOR",
    coop: "KOPERASI",
    wrongcoop: "KOPERASI",
    facilitator: "FASILITATOR",
    wrongfacilitator: "FASILITATOR",
  };
  for (const [key, id] of Object.entries(ids)) {
    await db.user.create({
      data: {
        id,
        email: `${id}@test.invalid`,
        name: `Test ${key}`,
        passwordHash: "not-used-by-service-tests",
        role: roleMap[key],
        verified: true,
        cooperativeId:
          key === "coop" ? coopId : key === "wrongcoop" ? otherCoopId : null,
      },
    });
    await db.account.create({
      data: { key: `wallet:${id}`, kind: "USER_WALLET", userId: id },
    });
  }
  await db.account.upsert({
    where: { key: "clearing" },
    create: { key: "clearing", kind: "DEMO_CLEARING" },
    update: {},
  });
  await db.account.create({
    data: { key: `coop:${coopId}`, kind: "COOP_WALLET", cooperativeId: coopId },
  });
  await db.membership.create({
    data: { userId: ids.fisher, cooperativeId: coopId },
  });
  await act("investor", "wallet.topup", { amount: 500000 });
  await act("second", "wallet.topup", { amount: 500000 });
  const topupKey = randomUUID();
  await Promise.all([
    act("investor", "wallet.topup", { amount: 50000 }, topupKey),
    act("investor", "wallet.topup", { amount: 50000 }, topupKey),
  ]);
  check(
    (await balance("investor")) === 550000n,
    "Top-up duplikat konkuren hanya satu kredit",
  );
  await rejected(
    () => act("investor", "wallet.topup", { amount: 100000 }, topupKey),
    "Kunci sama dengan payload berbeda ditolak",
  );
  await rejected(
    () =>
      act("investor", "wallet.topup", { amount: 50000, simulateFailure: true }),
    "Pembayaran gagal tidak mengubah saldo",
  );
  check(
    (await balance("investor")) === 550000n,
    "Saldo tetap setelah pembayaran gagal",
  );
  const projectId = await createProject("Proyek uji vertikal", 100000);
  await rejected(
    () => act("other", "project.submit", { id: projectId }),
    "Nelayan lain tidak dapat mengirim proyek",
  );
  await rejected(
    () => act("fisher", "project.submit", { id: projectId }),
    "Pengajuan tanpa dokumen ditolak",
  );
  await document("fisher", projectId, "PROJECT");
  await act("fisher", "project.submit", { id: projectId });
  check(
    (await db.scoreRun.findFirstOrThrow({ where: { projectId } }))
      .classification === "Tinggi",
    "Cold-start dihitung dan disimpan di backend",
  );
  await rejected(
    () =>
      act("investor", "project.review", {
        id: projectId,
        decision: "DISETUJUI",
        reason: "Bukan admin",
      }),
    "Akses lintas peran ditolak",
  );
  await act("admin", "project.review", {
    id: projectId,
    decision: "PERLU_REVISI",
    reason: "Perbaiki rencana operasional",
  });
  await act("fisher", "project.submit", { id: projectId });
  await act("admin", "project.review", {
    id: projectId,
    decision: "DISETUJUI",
    reason: "Syarat lengkap dan telah diperiksa",
  });
  await rejected(
    () => propose.call(null, projectId, 50000),
    "Target harus sesuai modal proyek",
  );
  await rejected(
    () =>
      act("wrongcoop", "offering.propose", {
        projectId,
        target: 100000,
        unitPrice: 50000,
        days: 30,
        risk: "Risiko cuaca dan harga hasil usaha.",
        proceeds: "Operasional dan persiapan usaha nelayan.",
      }),
    "Operator koperasi lain ditolak",
  );
  const offerId = await propose(projectId, 100000);
  let o = await db.offering.findUniqueOrThrow({
    where: { id: offerId },
    include: {
      prospectuses: true,
      agreement: { include: { stages: { orderBy: { number: "asc" } } } },
    },
  });
  const buy = {
    id: offerId,
    amount: 50000,
    prospectusId: o.prospectuses[0].id,
    accepted: true,
  };
  await rejected(
    () => act("investor", "offering.buy", buy),
    "Pembelian penawaran draf ditolak",
  );
  await act("admin", "offering.publish", {
    id: offerId,
    reason: "Penerbit dan prospektus telah ditinjau",
  });
  await act("investor", "security.lock", { locked: true });
  await rejected(
    () => act("investor", "offering.buy", buy),
    "Self-Lock memblokir pembelian server",
  );
  await rejected(
    () => act("investor", "wallet.topup", { amount: 50000 }),
    "Self-Lock memblokir top-up server",
  );
  await rejected(
    () => act("investor", "security.lock", { locked: false, code: "000000" }),
    "Kode unlock salah ditolak",
  );
  await act("investor", "security.lock", { locked: false, code: "123456" });
  await rejected(
    () => act("investor", "offering.buy", { ...buy, amount: 49999 }),
    "Minimum Rp50.000 dipaksakan server",
  );
  await rejected(
    () =>
      act("investor", "offering.buy", {
        ...buy,
        prospectusId: "wrong-version",
      }),
    "Persetujuan prospektus yang salah ditolak",
  );
  await rejected(
    () => act("investor", "offering.buy", { ...buy, simulateFailure: true }),
    "Kegagalan pembelian tidak memotong dana",
  );
  const purchaseKey = randomUUID();
  const duplicate = await Promise.all([
    act("investor", "offering.buy", buy, purchaseKey),
    act("investor", "offering.buy", buy, purchaseKey),
  ]);
  check(
    duplicate[0].id === duplicate[1].id,
    "Pembelian duplikat mengembalikan pesanan yang sama",
  );
  check(
    (await db.subscription.count({ where: { offeringId: offerId } })) === 1,
    "Satu pesanan untuk klik ganda",
  );
  const concurrent = await Promise.allSettled([
    act("investor", "offering.buy", buy),
    act("second", "offering.buy", buy),
  ]);
  check(
    concurrent.filter((x) => x.status === "fulfilled").length === 1,
    "Dua investor memperebutkan sisa target: satu berhasil",
  );
  o = await db.offering.findUniqueOrThrow({
    where: { id: offerId },
    include: {
      prospectuses: true,
      agreement: { include: { stages: { orderBy: { number: "asc" } } } },
    },
  });
  check(
    o.raised === 100000n && o.status === "SUKSES",
    "Target tidak terlampaui dan penawaran sukses",
  );
  const a = o.agreement!;
  const first = a.stages[0],
    second = a.stages[1];
  await rejected(
    () => act("admin", "stage.pay", { id: first.id }),
    "Dana tidak cair tanpa akad aktif",
  );
  await act("fisher", "agreement.sign", { id: a.id, accepted: true });
  await act("coop", "agreement.sign", { id: a.id, accepted: true });
  await rejected(
    () => act("wrongcoop", "agreement.sign", { id: a.id, accepted: true }),
    "Akad koperasi lain ditolak",
  );
  await act("admin", "offering.release", { id: offerId });
  await act("admin", "offering.release", { id: offerId });
  check(
    (await db.journal.count({
      where: { eventKey: `issuer_release:${offerId}` },
    })) === 1,
    "Pelepasan escrow idempoten",
  );
  await rejected(
    () =>
      act("admin", "stage.approve", {
        id: second.id,
        reason: "Tidak sesuai urutan",
      }),
    "Pencairan tahap di luar urutan ditolak",
  );
  await rejected(
    () => act("admin", "stage.pay", { id: first.id }),
    "Tahap tanpa persetujuan ditolak",
  );
  await db.stage.update({ where: { id: second.id }, data: { amount: 50000n } });
  await rejected(
    () =>
      act("admin", "stage.approve", {
        id: first.id,
        reason: "Jumlah tahap melampaui pagu",
      }),
    "Pagu akad diverifikasi server",
  );
  await db.stage.update({ where: { id: second.id }, data: { amount: 40000n } });
  await act("admin", "stage.approve", {
    id: first.id,
    reason: "Akad aktif dan persiapan sesuai rencana",
  });
  await act("admin", "stage.pay", { id: first.id });
  await act("admin", "stage.pay", { id: first.id });
  check(
    (await balance("fisher")) === 60000n,
    "Pencairan tahap masuk dompet sekali",
  );
  const reportInput = {
    projectId,
    period: `Panen ${runId}`,
    progress: 100,
    used: 60000,
    result: 1000000,
    note: "Panen fiktif selesai. Seluruh penggunaan dana telah didokumentasikan.",
  };
  await rejected(
    () => act("other", "report.submit", reportInput),
    "Laporan proyek milik orang lain ditolak",
  );
  const reportId = (await act("fisher", "report.submit", reportInput)).id!;
  await rejected(
    () =>
      act("admin", "report.review", {
        id: reportId,
        approve: true,
        reason: "Tanpa bukti tidak valid",
      }),
    "Validasi laporan wajib bukti",
  );
  await document("fisher", reportId, "REPORT");
  await act("admin", "report.review", {
    id: reportId,
    approve: true,
    reason: "Bukti dan hasil sesuai",
  });
  const beforeInvestor = await balance("investor");
  const beforeSecond = await balance("second");
  await act("admin", "report.distribute", { id: reportId });
  await act("admin", "report.distribute", { id: reportId });
  check(
    (await balance("fisher")) === 460000n,
    "Laba Rp1 juta: nelayan menerima Rp400.000",
  );
  check(
    (await balance("investor")) -
      beforeInvestor +
      (await balance("second")) -
      beforeSecond ===
      480000n,
    "Investor bersama menerima Rp480.000 tepat sekali",
  );
  check(
    (await db.account.findUniqueOrThrow({ where: { cooperativeId: coopId } }))
      .balance === 160000n,
    "Koperasi menyimpan Rp120.000 laba + Rp40.000 sisa tahap",
  );
  await act("admin", "stage.approve", {
    id: second.id,
    reason: "Laporan tahap pertama valid",
  });
  await act("admin", "stage.pay", { id: second.id });
  for (const result of [0, -100000]) {
    const id = (
      await act("fisher", "report.submit", {
        ...reportInput,
        period: `Hasil ${result}`,
        result,
      })
    ).id!;
    await document("fisher", id, "REPORT");
    await act("admin", "report.review", {
      id,
      approve: true,
      reason: "Data hasil telah ditinjau",
    });
    if (result === 0) {
      await act("admin", "report.distribute", { id });
      check(
        (
          await db.distribution.findFirstOrThrow({
            where: { reportId: id, type: "SECURITY_PAYOUT" },
          })
        ).amount === 0n,
        "Laba nol menghasilkan distribusi nol",
      );
    } else {
      check(
        (await db.report.findUniqueOrThrow({ where: { id } })).status ===
          "TINJAUAN_MANUAL",
        "Kerugian masuk tinjauan manual",
      );
      await rejected(
        () => act("admin", "report.distribute", { id }),
        "Kerugian tidak dibagikan otomatis",
      );
    }
  }
  const failedProject = await createProject(
    "Proyek gagal untuk refund",
    100000,
  );
  await document("fisher", failedProject, "PROJECT");
  await act("fisher", "project.submit", { id: failedProject });
  await act("admin", "project.review", {
    id: failedProject,
    decision: "DISETUJUI",
    reason: "Layak uji refund",
  });
  const failed = await propose(failedProject, 100000);
  await act("admin", "offering.publish", {
    id: failed,
    reason: "Penawaran demo siap",
  });
  const prospectus = await db.prospectus.findFirstOrThrow({
    where: { offeringId: failed },
  });
  const before = await balance("investor");
  await act("investor", "offering.buy", {
    id: failed,
    amount: 50000,
    prospectusId: prospectus.id,
    accepted: true,
  });
  await act("admin", "offering.expire", {
    id: failed,
    reason: "Simulasi periode berakhir",
  });
  await act("admin", "offering.expire", {
    id: failed,
    reason: "Ulangi refund idempoten",
  });
  check(
    (await balance("investor")) === before,
    "Refund mengembalikan nominal tepat sekali",
  );
  await act("admin", "assignment.create", {
    fisherId: ids.fisher,
    facilitatorId: ids.facilitator,
  });
  const assignment = await db.assignment.findUniqueOrThrow({
    where: {
      facilitatorId_fisherId: {
        facilitatorId: ids.facilitator,
        fisherId: ids.fisher,
      },
    },
  });
  await rejected(
    () =>
      act("wrongfacilitator", "assignment.note", {
        id: assignment.id,
        body: "Tidak boleh melihat penugasan lain",
      }),
    "Fasilitator tanpa penugasan ditolak",
  );
  await act("facilitator", "assignment.note", {
    id: assignment.id,
    body: "Catat produksi secara rutin dan lengkap.",
  });
  const journals = await db.journal.findMany({ include: { lines: true } });
  check(
    journals.every(
      (j) =>
        j.lines.length >= 2 &&
        j.lines.reduce((n, l) => n + l.amount, 0n) === 0n,
    ),
    "Semua jurnal selalu seimbang",
  );
  const accounts = await db.account.findMany({ include: { lines: true } });
  check(
    accounts.every(
      (a) => a.balance === a.lines.reduce((n, l) => n + l.amount, 0n),
    ),
    "Semua proyeksi saldo cocok dengan jurnal",
  );
  check(
    accounts.every((a) => a.kind === "DEMO_CLEARING" || a.balance >= 0n),
    "Tidak ada saldo dompet negatif",
  );
  const auditRecord = await db.audit.findFirstOrThrow();
  await assert.rejects(() =>
    db.audit.update({
      where: { id: auditRecord.id },
      data: { detail: "tamper" },
    }),
  );
  check(true, "Audit append-only ditolak database");
  console.log(
    `\n${checks} pemeriksaan integrasi lulus pada database terpisah.`,
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
