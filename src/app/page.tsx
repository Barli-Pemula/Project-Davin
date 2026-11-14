import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, FileText, ShieldCheck, Waves } from "lucide-react";
import { Brand } from "@/components/brand";
import { photos } from "@/lib/imagery";

const roles = [
  {
    number: "01",
    name: "Nelayan",
    title: "Ajukan kebutuhan usaha.",
    body: "Simpan rencana, lengkapi dokumen, lalu pantau peninjauan dan pencairan di satu ruang kerja.",
    href: "/daftar?peran=nelayan",
    action: "Buka ruang nelayan",
  },
  {
    number: "02",
    name: "Investor",
    title: "Baca sebelum mendanai.",
    body: "Lihat rencana usaha, risiko, prospektus, dan perkembangan dana simulasi sebelum mengambil keputusan.",
    href: "/daftar?peran=investor",
    action: "Jelajahi pendanaan",
  },
  {
    number: "03",
    name: "Admin",
    title: "Tinjau setiap tahapan.",
    body: "Kelola verifikasi, pengajuan, penawaran, akad, laporan, dan jejak transaksi dari satu portal.",
    href: "/masuk",
    action: "Masuk sebagai admin",
  },
];

export default function Home() {
  return (
    <div className="new-home" data-page="software">
      <header className="new-nav">
        <div className="new-wrap new-nav-inner">
          <Brand />
          <nav aria-label="Navigasi publik">
            <Link href="#peran">Peran</Link>
            <Link href="#proyek">Proyek</Link>
            <Link href="#alur">Alur</Link>
            <Link href="/edukasi">Edukasi</Link>
          </nav>
          <Link className="new-nav-action" href="/masuk">Masuk <ArrowUpRight size={17} /></Link>
        </div>
      </header>

      <main id="main">
        <section className="new-hero" data-enter>
          <div className="new-wrap new-hero-grid">
            <div className="new-hero-copy">
              <p className="new-kicker"><span /> PLATFORM PEMBIAYAAN MARITIM · MODE DEMO</p>
              <h1>Modal usaha nelayan. <em>Pendanaan yang jelas.</em></h1>
              <p className="new-lead">ARTANAYA mempertemukan rencana usaha pesisir dengan pendanaan simulasi. Dokumen, risiko, dan pergerakan dana dapat ditinjau di setiap tahap.</p>
              <div className="new-hero-actions">
                <Link className="new-button" href="/daftar?peran=nelayan">Ajukan modal usaha <ArrowUpRight size={19} /></Link>
                <Link className="new-text-link" href="/daftar?peran=investor">Jelajahi pendanaan <ArrowRight size={18} /></Link>
              </div>
              <p className="new-hero-foot"><ShieldCheck size={17} /> Simulasi dimulai dari Rp50.000 per unit. Tidak ada transaksi uang riil.</p>
            </div>
            <div className="new-product" aria-label="Pratinjau portal investor ARTANAYA">
              <div className="new-product-top"><span className="new-product-logo"><Waves size={17} /> ARTANAYA</span><span>PORTAL INVESTOR <span className="new-live-dot" /></span></div>
              <div className="new-product-body">
                <div className="new-product-label">PENDANAAN AKTIF <span>01 / 02</span></div>
                <div className="new-product-photo"><Image src={photos.seaweed.src} alt={photos.seaweed.alt} fill priority sizes="(max-width: 800px) 100vw, 50vw" /></div>
                <div className="new-product-info">
                  <div><span className="new-pill">Budidaya</span><span className="new-product-place">Karimunjawa, Jawa Tengah</span></div>
                  <strong className="new-product-title">Budidaya Rumput Laut Segara</strong>
                  <div className="new-product-progress"><div><strong>Rp13.500.000</strong><span> / Rp20.000.000</span></div><strong>67,5%</strong></div>
                  <div className="new-progress-track"><span /></div>
                  <div className="new-product-bottom"><span><FileText size={16} /> Prospektus tersedia</span><span>Mulai Rp50.000 <ArrowUpRight size={16} /></span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="new-roles" id="peran">
          <div className="new-wrap">
            <div className="new-section-head"><p className="new-kicker">SATU PROSES, TIGA RUANG KERJA</p><h2>Tiga portal untuk tiga peran.</h2></div>
            <div className="new-role-grid">
              {roles.map((role) => <article className="new-role" key={role.name}>
                <div className="new-role-meta"><span>{role.number}</span><span>{role.name}</span></div>
                <h3>{role.title}</h3><p>{role.body}</p>
                <Link href={role.href}>{role.action} <ArrowUpRight size={18} /></Link>
              </article>)}
            </div>
          </div>
        </section>

        <section className="new-projects" id="proyek">
          <div className="new-wrap new-projects-grid">
            <div className="new-projects-copy">
              <p className="new-kicker">PROYEK DALAM DEMO</p>
              <h2>Kenali usahanya. Pelajari dokumennya.</h2>
              <p>Setiap penawaran membawa rencana penggunaan dana, skor kelayakan, dan risiko. Investor dapat membacanya sebelum mencoba pembelian unit simulasi.</p>
              <Link className="new-text-link" href="/masuk">Lihat seluruh proyek <ArrowUpRight size={18} /></Link>
            </div>
            <div className="new-project-stack">
              <Link href="/masuk" className="new-project-tile"><div className="new-tile-photo"><Image src={photos.fishing.src} alt={photos.fishing.alt} fill sizes="(max-width: 800px) 100vw, 40vw" /></div><div><span>PERIKANAN TANGKAP · PACIRAN</span><strong className="new-tile-title">Peremajaan Kapal Tunas Laut</strong><p>Target pendanaan Rp15.000.000</p></div><ArrowUpRight size={20} /></Link>
              <Link href="/masuk" className="new-project-tile"><div className="new-tile-photo"><Image src={photos.fisher.src} alt={photos.fisher.alt} fill sizes="(max-width: 800px) 100vw, 40vw" /></div><div><span>BUDIDAYA · DEMAK</span><strong className="new-tile-title">Tambak Bandeng Mutiara Pesisir</strong><p>Target pendanaan Rp3.000.000</p></div><ArrowUpRight size={20} /></Link>
            </div>
          </div>
        </section>

        <section className="new-flow" id="alur">
          <div className="new-wrap">
            <div className="new-section-head"><p className="new-kicker">ALUR ARTANAYA</p><h2>Dari pengajuan hingga laporan usaha.</h2></div>
            <div className="new-flow-grid">
              {[['01','Pengajuan nelayan','Nelayan menyiapkan kebutuhan modal, data usaha, dan dokumen.'],['02','Tinjauan admin','Admin memeriksa identitas, skor, prospektus, serta kelayakan publikasi.'],['03','Portofolio dan laporan','Investor melihat pendanaan; nelayan mengirim laporan dan pencairan dicatat.']].map(([n,title,body]) => <div className="new-flow-step" key={n}><span>{n}</span><h3>{title}</h3><p>{body}</p></div>)}
            </div>
          </div>
        </section>

        <section className="new-close">
          <div className="new-wrap new-close-inner"><div><p className="new-kicker">MULAI DARI AKUN DEMO</p><h2>Masuk ke perjalanan yang sesuai dengan Anda.</h2><p>Nelayan, investor, dan admin memiliki ruang kerja masing-masing.</p></div><Link className="new-button new-button-light" href="/masuk">Masuk ke ARTANAYA <ArrowUpRight size={19} /></Link></div>
        </section>
      </main>
      <footer className="new-footer"><div className="new-wrap"><Brand /><p>Mode demo. Identitas, saldo, dan transaksi bersifat fiktif. Foto pesisir bersifat ilustratif.</p><Link href="/kredit-foto">Kredit foto</Link></div></footer>
    </div>
  );
}
