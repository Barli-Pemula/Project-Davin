import { z } from "zod";
const text = (min = 1, max = 2000) =>
  z
    .string()
    .trim()
    .min(min, `Isi minimal ${min} karakter.`)
    .max(max, `Maksimum ${max} karakter.`);
const money = z.coerce
  .number()
  .int("Gunakan rupiah bulat.")
  .min(0)
  .max(1000000000, "Maksimum demo Rp1 miliar.");
const signal = z.union([z.number().min(0).max(100), z.null()]);
export const projectSchema = z.object({
  id: z.string().optional(),
  title: text(5, 120),
  category: z.enum(["BUDIDAYA", "TANGKAP"]),
  location: text(3, 150),
  cooperativeId: text(),
  requested: money
    .min(50000)
    .refine((n) => n % 50000 === 0, "Modal harus kelipatan Rp50.000."),
  plan: text(20, 4000),
  signals: z.object({ T: signal, P: signal, K: signal, L: signal, R: signal }),
});
export const schemas = {
  "wallet.topup": z.object({
    amount: money.min(50000),
    simulateFailure: z.boolean().default(false),
  }),
  "security.lock": z.object({
    locked: z.boolean(),
    code: z.string().optional(),
  }),
  "kyc.submit": z.object({
    name: text(3, 100),
    location: text(3, 150),
    kusuka: z.string().max(50).optional(),
    code: z.literal("123456"),
    liveness: z.literal(true),
  }),
  "kyc.review": z.object({
    id: text(),
    approve: z.boolean(),
    reason: text(5, 500),
  }),
  "project.save": projectSchema,
  "project.submit": z.object({ id: text() }),
  "project.review": z.object({
    id: text(),
    decision: z.enum(["DISETUJUI", "PERLU_REVISI", "PERLU_PEMBINAAN"]),
    reason: text(5, 500),
  }),
  "offering.propose": z.object({
    projectId: text(),
    target: money.min(50000),
    unitPrice: money.min(50000),
    days: z.coerce.number().int().min(1).max(90),
    risk: text(20, 3000),
    proceeds: text(20, 3000),
  }),
  "offering.publish": z.object({ id: text(), reason: text(5, 500) }),
  "offering.buy": z.object({
    id: text(),
    amount: money.min(50000),
    prospectusId: text(),
    accepted: z.literal(true),
    simulateFailure: z.boolean().default(false),
  }),
  "offering.expire": z.object({ id: text(), reason: text(5, 500) }),
  "offering.release": z.object({ id: text() }),
  "agreement.sign": z.object({ id: text(), accepted: z.literal(true) }),
  "stage.approve": z.object({ id: text(), reason: text(5, 500) }),
  "stage.pay": z.object({ id: text() }),
  "report.submit": z.object({
    projectId: text(),
    period: text(3, 50),
    progress: z.coerce.number().int().min(0).max(100),
    used: money,
    result: z.coerce.number().int().min(-1000000000).max(1000000000),
    note: text(20, 4000),
  }),
  "report.review": z.object({
    id: text(),
    approve: z.boolean(),
    reason: text(5, 500),
  }),
  "report.distribute": z.object({ id: text() }),
  "alert.resolve": z.object({ id: text(), reason: text(5, 500) }),
  "alert.assign": z.object({ id: text() }),
  "assignment.create": z.object({ fisherId: text(), facilitatorId: text() }),
  "assignment.note": z.object({ id: text(), body: text(10, 2000) }),
} as const;
export type ActionName = keyof typeof schemas;
