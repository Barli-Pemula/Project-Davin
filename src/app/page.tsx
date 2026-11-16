import Link from "next/link";
import Image from "next/image";
import { Brand } from "@/components/brand";
import { photos, projectPhoto } from "@/lib/imagery";
import { db } from "@/lib/db";
import { rupiah, statusLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

const journey = [
  { number: "01", title: "Rencana usaha disiapkan", body: "Nelayan mencatat kebutuhan modal, rencana penggunaan dana, dan bukti usaha melalui koperasi." },
  { number: "02", title: "Berkas dan skor ditinjau", body: "Admin memeriksa identitas, dokumen, lima sinyal kelayakan, dan alasan keputusan." },
  { number: "03", title: "Investor membaca penawaran", body: "Risiko, prospektus, harga unit, dan progres pendanaan tersedia sebelum pembelian simulasi." },
  { number: "04", title: "Dana dan hasil dicatat", body: "Pencairan bertahap, laporan usaha, serta pembagian hasil tercatat dalam jurnal demo." },
];

export default async function Home() {
  const offerings = await db.offering.findMany({
    where: { publishedAt: { not: null } },
    include: { project: { include: { cooperative: true } } },
    orderBy: { publishedAt: "desc" },
    take: 2,
  });

  return (
    <div className="rebuild-home">
      <header className="rebuild-nav">
        <div className="rebuild-container rebuild-nav-inner">
          <Brand />
          <nav aria-label="Navigasi publik">
            <Link href="#cara-kerja">Cara kerja</Link>
            <Link href="#penawaran">Penawaran</Link>
            <Link href="/edukasi">Edukasi</Link>
          </nav>
          <Link className="rebuild-login" href="/masuk">Masuk</Link>
        </div>
      </header>

      <main id="main">
        <section className="rebuild-hero" aria-labelledby="rebuild-hero-title">
          <div className="rebuild-container rebuild-hero-grid">
            <div className="rebuild-hero-copy">
              <p className="rebuild-overline">ARTANAYA / PEMBIAYAAN MARITIM / MODE DEMO</p>
              <h1 id="rebuild-hero-title">Modal untuk usaha pesisir. <em>Setiap langkah terlihat.</em></h1>
              <p className="rebuild-intro">Nelayan menyiapkan rencana usaha. Koperasi dan admin meninjau. Investor membaca risiko sebelum mencoba pendanaan fiktif.</p>
              <div className="rebuild-actions">
                <Link className="rebuild-primary" href="/daftar?peran=nelayan">Ajukan modal usaha</Link>
                <Link className="rebuild-secondary" href="/daftar?peran=investor">Daftar sebagai investor <span aria-hidden="true">↗</span></Link>
              </div>
              <p className="rebuild-note">Seluruh saldo, efek, dan transaksi di web ini adalah simulasi.</p>
            </div>
            <figure className="rebuild-hero-photo">
              <Image src={photos.seaweed.src} alt={photos.seaweed.alt} fill priority sizes="(max-width: 800px) 100vw, 80vw" />
              <figcaption><span>01 / KEGIATAN PESISIR</span><span>Foto ilustrasi, Nusa Lembongan</span></figcaption>
            </figure>
          </div>
          <div className="rebuild-container rebuild-hero-rule"><span>BERLAYAR. BERTUMBUH. BERSAMA.</span><span>GULIR UNTUK MEMAHAMI PROSES</span></div>
        </section>

        <section className="rebuild-roles" aria-labelledby="rebuild-roles-title">
          <div className="rebuild-container">
            <div className="rebuild-section-lead"><p className="rebuild-overline">TIGA RUANG KERJA</p><h2 id="rebuild-roles-title">Peran yang jelas, keputusan yang dapat ditelusuri.</h2></div>
            <div className="rebuild-role-list">
              <article><span>01 / NELAYAN</span><h3>Siapkan usaha.</h3><p>Simpan draf, lengkapi bukti, kirim pengajuan, lalu ikuti status dan pencairan.</p><Link href="/daftar?peran=nelayan">Buka ruang nelayan</Link></article>
              <article><span>02 / INVESTOR</span><h3>Baca sebelum mendanai.</h3><p>Periksa usaha, koperasi, skor, prospektus, risiko, dan mutasi saldo demo.</p><Link href="/daftar?peran=investor">Buka ruang investor</Link></article>
              <article><span>03 / ADMIN</span><h3>Tinjau setiap tahap.</h3><p>Kelola verifikasi, pengajuan, akad, laporan, pendampingan, dan audit.</p><Link href="/masuk">Masuk sebagai admin</Link></article>
            </div>
          </div>
        </section>

        <section className="rebuild-offers" id="penawaran" aria-labelledby="rebuild-offers-title">
          <div className="rebuild-container rebuild-offers-grid">
            <div className="rebuild-offers-lead"><p className="rebuild-overline">PENAWARAN DALAM DEMO</p><h2 id="rebuild-offers-title">Lihat usahanya sebelum melihat angka.</h2><p>Setiap penawaran yang diterbitkan memuat rencana, risiko, prospektus, dan koperasi penerbit. Masuk sebagai investor untuk membaca seluruh detailnya.</p><Link className="rebuild-text-link" href="/masuk">Masuk untuk melihat penawaran</Link></div>
            <div className="rebuild-offer-list">
              {offerings.length ? offerings.map((offer) => (
                <article className="rebuild-offer" key={offer.id}>
                  <div className="rebuild-offer-photo"><Image src={projectPhoto(offer.project.category).src} alt={`${projectPhoto(offer.project.category).alt}; ilustrasi kategori usaha`} fill sizes="(max-width: 800px) 100vw, 28vw" /></div>
                  <div className="rebuild-offer-info"><span>{offer.project.category === "TANGKAP" ? "PERIKANAN TANGKAP" : "BUDIDAYA"} / {offer.project.location}</span><h3>{offer.project.title}</h3><p>{offer.project.cooperative.name} · {statusLabel(offer.status)}</p><div><strong>{rupiah(offer.raised)}</strong><span>dari {rupiah(offer.target)}</span></div></div>
                </article>
              )) : <p className="rebuild-offer-empty">Belum ada penawaran yang diterbitkan dalam demo ini.</p>}
            </div>
          </div>
        </section>

        <section className="rebuild-journey" id="cara-kerja" aria-labelledby="rebuild-journey-title">
          <div className="rebuild-container">
            <div className="rebuild-section-lead"><p className="rebuild-overline">ALUR ARTANAYA</p><h2 id="rebuild-journey-title">Dari pengajuan hingga laporan usaha.</h2></div>
            <ol className="rebuild-journey-list">{journey.map((step) => <li key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.body}</p></li>)}</ol>
          </div>
        </section>

        <section className="rebuild-final" aria-labelledby="rebuild-final-title">
          <div className="rebuild-container rebuild-final-grid"><div><p className="rebuild-overline">SEBELUM MENCOBA</p><h2 id="rebuild-final-title">Pahami risikonya. Baru ambil keputusan.</h2><p>Skor berasal dari aturan demo, bukan prediksi AI. Hasil usaha tidak dijamin. Dana yang terlihat hanya simulasi.</p></div><div className="rebuild-final-actions"><Link className="rebuild-primary rebuild-primary-light" href="/edukasi">Baca panduan ARTANAYA</Link><Link href="/masuk">Masuk ke akun demo</Link></div></div>
        </section>
      </main>
      <footer className="rebuild-footer"><div className="rebuild-container"><Brand /><p>ARTANAYA adalah demonstrasi. Identitas dan transaksi bersifat fiktif.</p><Link href="/kredit-foto">Kredit foto</Link></div></footer>
    </div>
  );
}
