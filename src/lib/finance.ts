import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { ensure } from "./domain";
export type Tx = Prisma.TransactionClient;
export async function atomic<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await db.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 10000,
        timeout: 20000,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ["P2034", "P2002"].includes(error.code) &&
        attempt < 4
      ) {
        await new Promise((r) => setTimeout(r, 30 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Transaksi sibuk. Silakan ulangi.");
}
export async function audit(
  tx: Tx,
  actorId: string | null,
  action: string,
  entityId: string,
  detail: string,
) {
  return tx.audit.create({
    data: { actorId, action, entity: action.split(".")[0], entityId, detail },
  });
}
export async function journal(
  tx: Tx,
  actorId: string | null,
  eventKey: string,
  type: string,
  reference: string,
  lines: { accountId: string; amount: bigint }[],
) {
  const existing = await tx.journal.findUnique({ where: { eventKey } });
  if (existing) return existing;
  ensure(
    lines.length >= 2 &&
      lines.every((l) => l.amount !== 0n) &&
      lines.reduce((n, l) => n + l.amount, 0n) === 0n,
    "Jurnal tidak seimbang.",
  );
  const summed = new Map<string, bigint>();
  for (const line of lines)
    summed.set(
      line.accountId,
      (summed.get(line.accountId) ?? 0n) + line.amount,
    );
  for (const [id, delta] of summed) {
    const account = await tx.account.findUniqueOrThrow({ where: { id } });
    ensure(
      account.kind === "DEMO_CLEARING" || account.balance + delta >= 0n,
      "Saldo sumber dana tidak mencukupi.",
    );
    await tx.account.update({
      where: { id },
      data: { balance: { increment: delta } },
    });
  }
  const hash = createHash("sha256")
    .update(
      JSON.stringify({
        eventKey,
        type,
        reference,
        lines: lines.map((l) => ({
          accountId: l.accountId,
          amount: l.amount.toString(),
        })),
      }),
    )
    .digest("hex");
  const entry = await tx.journal.create({
    data: {
      actorId,
      eventKey,
      type,
      reference,
      hash,
      lines: { create: lines },
    },
  });
  await audit(
    tx,
    actorId,
    "dana." + type,
    reference,
    `Jurnal ${entry.id}; ${lines.length} baris seimbang`,
  );
  return entry;
}
export async function transfer(
  tx: Tx,
  actorId: string | null,
  key: string,
  type: string,
  ref: string,
  from: string,
  to: string,
  amount: bigint,
) {
  ensure(amount > 0n, "Nominal harus positif.");
  return journal(tx, actorId, key, type, ref, [
    { accountId: from, amount: -amount },
    { accountId: to, amount },
  ]);
}
