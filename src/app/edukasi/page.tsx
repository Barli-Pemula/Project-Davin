import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ShieldCheck,
  HelpCircle,
  Search,
  FileText,
  ChartNoAxesCombined,
  ChevronDown,
} from "lucide-react";
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
          Mulai dari langkah sederhana. Buka penjelasan hanya saat Anda ingin
          tahu lebih jauh.
        </p>
        <section
          className="education-start"
          aria-labelledby="education-start-title"
        >
          <span className="eyebrow">MULAI DARI SINI</span>
          <h2 id="education-start-title">Tiga langkah mencoba demo</h2>
          <div className="education-start-grid">
            <div>
              <span className="education-step-icon">
                <Search size={21} />
              </span>
              <span className="education-step-number">01</span>
              <strong>Pilih usaha</strong>
              <p>Lihat tujuan proyek dan siapa koperasi pendampingnya.</p>
            </div>
            <div>
              <span className="education-step-icon">
                <FileText size={21} />
              </span>
              <span className="education-step-number">02</span>
              <strong>Baca risikonya</strong>
              <p>Periksa dokumen proyek dan contoh pembagian hasil.</p>
            </div>
            <div>
              <span className="education-step-icon">
                <ChartNoAxesCombined size={21} />
              </span>
              <span className="education-step-number">03</span>
              <strong>Ikuti hasilnya</strong>
              <p>Coba pendanaan fiktif dan pantau perkembangannya.</p>
            </div>
          </div>
        </section>
        <div className="education-topic-heading">
          <span className="eyebrow">HAL PENTING UNTUK DIPAHAMI</span>
          <h2>Jawaban singkat, detail saat dibutuhkan.</h2>
          <p>Pilih pertanyaan untuk membuka penjelasannya.</p>
        </div>
        <div className="education-grid">
          {[
            [
              "01",
              "Siapa yang mengelola pendanaan?",
              "Koperasi mendampingi nelayan dan menerbitkan penawaran demo.",
              "Dalam simulasi ini, koperasi menerbitkan penawaran berbasis prinsip syariah. Investor membaca dokumen penawaran (prospektus) dan menyetujui risikonya. Nelayan menerima pembiayaan melalui akad mudharabah yang terpisah dengan koperasi.",
            ],
            [
              "02",
              "Bagaimana hasil usaha dibagi?",
              "Hasil mengikuti laba usaha, bukan angka yang dijamin.",
              "Contoh demo: jika laba usaha Rp1.000.000, sebesar 60% menjadi porsi koperasi dan 40% porsi nelayan. Dari porsi koperasi, 80% (Rp480.000) dibagikan kepada investor sesuai proporsi pendanaannya. Koperasi menyimpan Rp120.000. Ini hanya contoh, bukan janji hasil.",
            ],
            [
              "03",
              "Apa jika target belum terpenuhi?",
              "Saldo demo yang dipesan akan kembali bila penawaran gagal.",
              "Saat periode penawaran berakhir tanpa mencapai target, saldo simulasi pesanan dikembalikan ke masing-masing investor. Admin dapat mencoba alur ini di demo. Catatan transaksi mencegah pengembalian ganda.",
            ],
            [
              "04",
              "Risiko apa yang perlu dipahami?",
              "Cuaca, hasil produksi, dan harga jual dapat berubah.",
              "Hasil usaha dipengaruhi cuaca, produksi, harga komoditas, dan biaya operasional. Angka skenario dapat berbeda dari hasil sebenarnya; jika tidak ada laba, tidak ada bagi hasil. Kerugian ditinjau manual dalam demo. Pembagian kerugian dan pengembalian pokok tidak dijalankan otomatis.",
            ],
            [
              "05",
              "Dari mana skor proyek berasal?",
              "Skor membantu peninjauan, tetapi keputusan tetap melibatkan admin.",
              "Skor demo dihitung dari transaksi (25%), produksi (30%), keanggotaan (15%), legalitas (15%), dan riwayat akad (15%). Nelayan baru yang belum punya riwayat akad dapat dinilai dari empat data lain yang lengkap. Hasilnya tetap ditinjau admin.",
            ],
            [
              "06",
              "Apakah semua teknologinya nyata?",
              "Beberapa fitur dibuat sebagai simulasi untuk presentasi.",
              "Belum. Catatan transaksi demo memakai hash SHA-256 dan database. Skor dihitung dengan aturan berbobot yang dapat dijelaskan, bukan AI produksi. Radar, pemeriksaan wajah, verifikasi tambahan, pembayaran, dan identitas seluruhnya simulasi.",
            ],
          ].map(([n, title, teaser, detail]) => (
            <article className="panel education-card" key={n}>
              <span className="number-label">{n}</span>
              <span className="education-card-icon">
                <BookOpen size={21} />
              </span>
              <h2>{title}</h2>
              <p className="education-card-teaser">{teaser}</p>
              <details>
                <summary>
                  Baca penjelasan <ChevronDown size={16} />
                </summary>
                <p className="education-card-answer">{detail}</p>
              </details>
            </article>
          ))}
        </div>
        <section className="panel faq">
          <h2>
            <HelpCircle size={22} /> Bantuan saat mencoba
          </h2>
          <details>
            <summary>Bagaimana mencoba lima peran?</summary>
            <p>
              Buka halaman masuk, pilih akun demo, lalu masuk. Keluar untuk
              berganti peran. Data transaksi tetap tersimpan di database.
            </p>
          </details>
          <details>
            <summary>Bagaimana membuka akun yang dikunci sendiri?</summary>
            <p>
              Buka Pusat Keamanan, pilih verifikasi ulang, lalu masukkan kode
              demo 123456. Tidak ada SMS atau pemeriksaan biometrik nyata.
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
