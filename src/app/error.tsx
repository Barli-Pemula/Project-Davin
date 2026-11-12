"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="loading-page">
      <h1>Belum dapat memuat halaman.</h1>
      <p>Coba muat ulang halaman. Jika masalah berlanjut, jalankan ulang demo lokal.</p>
      <button className="btn btn-primary" onClick={reset}>
        Coba lagi
      </button>
      <Link href="/">Kembali ke beranda</Link>
    </main>
  );
}
