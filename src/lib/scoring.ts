export const SIGNALS = ["T", "P", "K", "L", "R"] as const;
export type Signals = Record<(typeof SIGNALS)[number], number | null>;
export const BASE_WEIGHTS = { T: 25, P: 30, K: 15, L: 15, R: 15 };
export function scoreProject(signals: Signals) {
  for (const key of SIGNALS) {
    const v = signals[key];
    if (v !== null && (!Number.isFinite(v) || v < 0 || v > 100))
      throw new Error("Sinyal harus 0–100 atau kosong.");
  }
  const available = SIGNALS.filter((k) => signals[k] !== null);
  const totalWeight = available.reduce((n, k) => n + BASE_WEIGHTS[k], 0);
  const numerator = available.reduce(
    (n, k) => n + signals[k]! * BASE_WEIGHTS[k],
    0,
  );
  const score = totalWeight ? numerator / totalWeight : null;
  const newcomer =
    signals.R === null &&
    ["T", "P", "K", "L"].every((k) => signals[k as keyof Signals] !== null);
  const provisional = available.length < 5 && !newcomer;
  const classification =
    score === null
      ? "Belum ada skor"
      : provisional
        ? "Perlu Verifikasi Tambahan"
        : numerator >= 70 * totalWeight
          ? "Tinggi"
          : numerator >= 50 * totalWeight
            ? "Sedang"
            : "Perlu Pembinaan";
  const weights = Object.fromEntries(
    SIGNALS.map((k) => [
      k,
      signals[k] === null ? 0 : BASE_WEIGHTS[k] / totalWeight,
    ]),
  );
  const reason =
    score === null
      ? "Belum ada sinyal yang dapat dinilai."
      : provisional
        ? "Sinyal belum lengkap. Lengkapi bukti usaha sebelum publikasi."
        : newcomer
          ? "Nelayan Baru: empat sinyal lengkap; bobot dinormalisasi dengan 0,85."
          : classification === "Sedang"
            ? "Direkomendasikan pendampingan fasilitator."
            : classification === "Perlu Pembinaan"
              ? "Perlu pembinaan dan pengajuan ulang."
              : "Memenuhi ambang skor; tetap memerlukan tinjauan admin.";
  return { score, classification, provisional, newcomer, weights, reason };
}
