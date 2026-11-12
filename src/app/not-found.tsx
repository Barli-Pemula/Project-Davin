import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="loading-page">
      <span className="eyebrow">404 · DI LUAR PETA</span>
      <h1>Halaman belum ditemukan.</h1>
      <Link href="/portal" className="btn btn-primary">
        Kembali ke beranda
      </Link>
    </main>
  );
}
