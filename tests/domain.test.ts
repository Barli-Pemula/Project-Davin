import { describe, it, expect } from "vitest";
import { scoreProject, type Signals } from "../src/lib/scoring";
import { purchaseGuard, allocate } from "../src/lib/domain";
const all = (n: number): Signals => ({ T: n, P: n, K: n, L: n, R: n });
describe("Scoring ACS-DEMO-1.0", () => {
  it.each([
    [49.999, "Perlu Pembinaan"],
    [50, "Sedang"],
    [69.999, "Sedang"],
    [70, "Tinggi"],
    [100, "Tinggi"],
  ])("batas %s menghasilkan %s", (n, label) =>
    expect(scoreProject(all(Number(n))).classification).toBe(label),
  );
  it("cold-start menormalkan empat sinyal dengan 0,85", () => {
    const s = scoreProject({ ...all(70), R: null });
    expect(s.score).toBe(70);
    expect(s.newcomer).toBe(true);
    expect(s.provisional).toBe(false);
    expect(s.weights.T).toBeCloseTo(25 / 85);
  });
  it("nilai nol tidak dianggap hilang", () => {
    const s = scoreProject(all(0));
    expect(s.score).toBe(0);
    expect(s.provisional).toBe(false);
    expect(s.classification).toBe("Perlu Pembinaan");
  });
  it("sinyal wajib kosong berarti sementara", () => {
    const s = scoreProject({ ...all(80), T: null });
    expect(s.score).toBe(80);
    expect(s.provisional).toBe(true);
    expect(s.weights.T).toBe(0);
  });
  it("semua kosong menghasilkan null", () =>
    expect(
      scoreProject({ T: null, P: null, K: null, L: null, R: null }).score,
    ).toBeNull());
  it("R tersedia sendiri tetap sementara", () => {
    const s = scoreProject({ T: null, P: null, K: null, L: null, R: 0 });
    expect(s.score).toBe(0);
    expect(s.provisional).toBe(true);
  });
  it("menolak input di luar skala", () =>
    expect(() => scoreProject({ ...all(70), T: 101 })).toThrow());
});
describe("Aturan pembelian", () => {
  const valid = {
    amount: 50000n,
    unit: 50000n,
    balance: 100000n,
    remaining: 100000n,
    locked: false,
    verified: true,
    active: true,
  };
  it("menerima Rp50.000", () =>
    expect(() => purchaseGuard(valid)).not.toThrow());
  it.each([
    { amount: 49999n },
    { amount: 75000n },
    { amount: 150000n },
    { balance: 0n },
    { remaining: 0n },
    { locked: true },
    { verified: false },
    { active: false },
  ])("menolak kondisi tidak valid %o", (change) =>
    expect(() => purchaseGuard({ ...valid, ...change })).toThrow(),
  );
});
describe("Distribusi deterministik", () => {
  it("membagi sesuai proporsi dan menjaga jumlah", () => {
    const a = allocate(480001n, [
      { id: "b", amount: 50000n },
      { id: "a", amount: 100000n },
    ]);
    expect(a.reduce((n, x) => n + x.payout, 0n)).toBe(480001n);
    expect(a[0].payout).toBe(320001n);
    expect(a[1].payout).toBe(160000n);
  });
  it("laba nol menghasilkan payout nol", () =>
    expect(allocate(0n, [{ id: "a", amount: 50000n }])[0].payout).toBe(0n));
});
