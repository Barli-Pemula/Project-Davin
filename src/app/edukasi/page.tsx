import Link from "next/link";
import { ArrowLeft, BookOpen, ShieldCheck, HelpCircle } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
export default function Education() {
  return (
    <>
      <header className="public-header">
        <Brand />
        <Button asChild variant="outline">
          <Link href="/masuk">Masuk ke demo</Link>
        </Button>
      </header>
      <main id="main" className="education-page">
        <Link href="/" className="text-link">
          <ArrowLeft size={16} /> Beranda
        </Link>
        <span className="eyebrow">RUANG BELAJAR BAHARI</span>
        <h1>
          Pahami dulu.
          <br />
          <em>Melangkah lebih yakin.</em>
        </h1>
        <p className="lead">
          Panduan singkat untuk mengenal alur pembiayaan ARTANAYA.
        </p>
        <div className="education-grid">
          {[
            [
              "01",
              "Siapa yang menerbitkan efek?",
              "Koperasi adalah penerbit efek syariah simulasi. Investor menyetujui prospektus penawaran koperasi. Nelayan menerima manfaat pembiayaan melalui akad mudharabah yang terpisah dengan koperasi.",
            ],
            [
              "02",
              "Bagaimana bagi hasil dihitung?",
              "Contoh demo: laba usaha Rp1.000.000 dibagi 60% ke koperasi dan 40% ke nelayan. Investor bersama menerima 80% dari porsi koperasi (Rp480.000), sesuai proporsi pesanan. Koperasi menyimpan Rp120.000. Ini contoh perhitungan, bukan janji hasil.",
            ],
            [
              "03",
              "Apa yang terjadi jika target tidak tercapai?",
              "Penawaran yang gagal akan mengembalikan saldo simulasi pesanan ke masing-masing investor. Admin dapat mengakhiri periode demo untuk mencoba alur ini. Jurnal refund mencegah pengembalian ganda.",
            ],
            [
              "04",
              "Apa saja risikonya?",
              "Hasil dipengaruhi cuaca, produksi, harga komoditas, dan operasional. Skenario hasil dapat berbeda dari realisasi. Laba nol berarti hasil nol. Kerugian masuk tinjauan manual; demo tidak mengotomatiskan pembagian kerugian atau pengembalian pokok.",
            ],
            [
              "05",
              "Bagaimana skor kelayakan bekerja?",
              "Skor aturan demo memakai transaksi (25%), produksi (30%), keanggotaan (15%), legalitas (15%), dan riwayat akad (15%). Nelayan baru tanpa riwayat dapat dinilai dari empat sinyal lengkap. Skor tetap ditinjau admin.",
            ],
            [
              "06",
              "Apakah ini blockchain atau AI produksi?",
              "Belum. Ledger demo menggunakan hash SHA-256 dan jurnal database. Scoring berupa perhitungan berbobot yang transparan. Radar, liveness, MFA, pembayaran, dan identitas seluruhnya simulasi.",
            ],
          ].map(([n, t, d]) => (
            <article className="panel education-card" key={n}>
              <span className="number-label">{n}</span>
              <BookOpen size={23} />
              <h2>{t}</h2>
              <p>{d}</p>
            </article>
          ))}
        </div>
        <section className="panel faq">
          <h2>
            <HelpCircle size={22} /> Ruang konsultasi
          </h2>
          <details>
            <summary>Bagaimana mencoba lima peran?</summary>
            <p>
              Buka halaman masuk, pilih akun demo, lalu masuk. Keluar untuk
              berganti peran. Data transaksi tetap tersimpan di database.
            </p>
          </details>
          <details>
            <summary>Bagaimana cara membuka Self-Lock?</summary>
            <p>
              Buka Pusat Keamanan, pilih verifikasi ulang, dan masukkan kode
              demo 123456. Tidak ada SMS atau biometrik nyata yang dikirim.
            </p>
          </details>
          <details>
            <summary>Di mana saya mendapat bantuan?</summary>
            <p>
              {process.env.NEXT_PUBLIC_HELP_WHATSAPP ? (
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_HELP_WHATSAPP.replace(/\D/g, "")}`}
                >
                  Hubungi bantuan melalui WhatsApp
                </a>
              ) : (
                "Bantuan demo: masuk sebagai fasilitator untuk melihat pendampingan nelayan yang ditugaskan. Kanal WhatsApp belum dikonfigurasi."
              )}
            </p>
          </details>
          <div className="notice">
            <ShieldCheck size={19} /> Gunakan hanya data dan dokumen fiktif di
            Mode Demo.
          </div>
        </section>
      </main>
    </>
  );
}
