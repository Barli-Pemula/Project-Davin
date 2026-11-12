"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="loading-page">
      <h1>Belum dapat memuat halaman.</h1>
      <p>Periksa koneksi aplikasi dan database, lalu coba lagi.</p>
      <button className="btn btn-primary" onClick={reset}>
        Coba lagi
      </button>
      <Link href="/">Kembali ke beranda</Link>
    </main>
  );
}
