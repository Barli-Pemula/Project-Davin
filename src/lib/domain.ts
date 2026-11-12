export class DomainError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function ensure(
  condition: unknown,
  message: string,
  status = 400,
): asserts condition {
  if (!condition) throw new DomainError(message, status);
}
export function purchaseGuard(input: {
  amount: bigint;
  unit: bigint;
  balance: bigint;
  remaining: bigint;
  locked: boolean;
  verified: boolean;
  active: boolean;
}) {
  ensure(
    !input.locked,
    "Akun terkunci. Lakukan verifikasi ulang untuk melanjutkan.",
  );
  ensure(input.verified, "Selesaikan verifikasi identitas terlebih dahulu.");
  ensure(
    input.active,
    "Masa penawaran sudah berakhir atau penawaran tidak aktif.",
  );
  ensure(input.amount >= 50000n, "Minimum pembelian adalah Rp50.000.");
  ensure(
    input.unit > 0n && input.amount % input.unit === 0n,
    "Nominal harus kelipatan harga unit.",
  );
  ensure(input.amount <= input.balance, "Saldo simulasi tidak mencukupi.");
  ensure(
    input.amount <= input.remaining,
    "Nominal melebihi sisa target pendanaan.",
  );
}
export function allocate(
  total: bigint,
  positions: { id: string; amount: bigint }[],
) {
  const sorted = [...positions].sort((a, b) => a.id.localeCompare(b.id));
  const base = sorted.reduce((n, x) => n + x.amount, 0n);
  ensure(base > 0n, "Tidak ada posisi investor.");
  const lines = sorted.map((x) => ({
    ...x,
    payout: (total * x.amount) / base,
  }));
  let left = total - lines.reduce((n, x) => n + x.payout, 0n);
  for (const line of lines) {
    if (left > 0n) {
      line.payout++;
      left--;
    }
  }
  return lines;
}
