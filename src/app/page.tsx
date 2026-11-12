import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Sprout,
  Waves,
  Check,
  Anchor,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <div className="landing">
      <header className="public-header">
        <Brand />
        <nav>
          <Link href="#tentang">Tentang ARTANAYA</Link>
          <Link href="/edukasi">Pusat edukasi</Link>
          <span className="badge amber">Mode Demo</span>
        </nav>
        <Button asChild variant="outline">
          <Link href="/masuk">
            Masuk <ArrowUpRight size={16} />
          </Link>
        </Button>
      </header>
      <main id="main">
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="dot" /> MASA DEPAN EKONOMI BIRU
            </span>
            <h1>
              Laut penuh potensi.
              <br />
              Mari tumbuh
              <br />
              <em>bersama.</em>
            </h1>
            <p>
              Hubungkan niat baik Anda dengan usaha nelayan Indonesia.
              Pembiayaan melalui koperasi, berlandaskan prinsip syariah dan
              transparansi.
            </p>
            <div className="hero-actions">
              <Button asChild size="lg">
                <Link href="/masuk">
                  Jelajahi pendanaan <ArrowUpRight size={19} />
                </Link>
              </Button>
              <Link className="text-link" href="/daftar?peran=nelayan">
                Saya nelayan <ArrowRight size={17} />
              </Link>
            </div>
            <div className="hero-assurance">
              <ShieldCheck size={18} /> Transparan sejak awal <span>•</span>{" "}
              Mulai Rp50.000
            </div>
          </div>
          <div className="hero-visual">
            <Image
              src="/coast.svg"
              alt="Ilustrasi perahu layar di antara pulau pesisir Indonesia"
              fill
              priority
              sizes="(max-width: 800px) 100vw, 50vw"
            />
            <div className="image-note">
              <div className="icon-box">
                <Waves size={22} />
              </div>
              <div>
                <small>DARI PESISIR, UNTUK MASA DEPAN</small>
                <strong>Setiap langkah membawa dampak.</strong>
              </div>
            </div>
            <div className="floating-label">
              <span className="dot" /> TERHUBUNG OLEH KEPERCAYAAN
            </div>
          </div>
        </section>
        <section className="trust-strip">
          <span>
            Modal kecil.
            <br />
            <strong>Harapan yang lebih besar.</strong>
          </span>
          <div>
            <Anchor />
            <p>
              <strong>Koperasi sebagai penerbit</strong>
              <small>Mendampingi usaha nelayan</small>
            </p>
          </div>
          <div>
            <ShieldCheck />
            <p>
              <strong>Jejak dana transparan</strong>
              <small>Setiap transaksi tercatat</small>
            </p>
          </div>
          <div>
            <Sprout />
            <p>
              <strong>Bertumbuh secara inklusif</strong>
              <small>Peluang untuk nelayan baru</small>
            </p>
          </div>
        </section>
        <section id="tentang" className="landing-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">LANGKAH KECIL, DAMPAK BERARTI</span>
              <h2>Kenali usaha di balik harapan.</h2>
            </div>
            <Link className="text-link" href="/masuk">
              Lihat pendanaan <ArrowRight size={17} />
            </Link>
          </div>
          <div className="landing-projects">
            <article className="story-card">
              <Image
                src="/seaweed.svg"
                alt="Ilustrasi budidaya rumput laut"
                width={800}
                height={480}
              />
              <div>
                <span className="badge">Budidaya</span>
                <h3>Rumput laut yang menumbuhkan harapan.</h3>
                <p>
                  Dukung produktivitas pesisir melalui sarana budidaya dan
                  pendampingan koperasi.
                </p>
                <Link href="/masuk" className="text-link">
                  Kenali proyek <ArrowUpRight size={17} />
                </Link>
              </div>
            </article>
            <article className="story-card">
              <Image
                src="/fishing.svg"
                alt="Ilustrasi kapal nelayan"
                width={800}
                height={480}
              />
              <div>
                <span className="badge">Perikanan tangkap</span>
                <h3>Perjalanan baru untuk nelayan kita.</h3>
                <p>
                  Dari peremajaan kapal hingga alat tangkap ramah lingkungan,
                  mulai bersama.
                </p>
                <Link href="/masuk" className="text-link">
                  Kenali proyek <ArrowUpRight size={17} />
                </Link>
              </div>
            </article>
          </div>
        </section>
        <section className="how-section">
          <div>
            <span className="eyebrow">LEBIH PAHAM, LEBIH PERCAYA</span>
            <h2>
              Langkah Anda.
              <br />
              Masa depan bersama.
            </h2>
            <p>
              Pahami dokumen dan risiko sebelum membuat keputusan pendanaan.
            </p>
            <Link href="/edukasi" className="text-link">
              Pelajari cara kerjanya <ArrowRight size={17} />
            </Link>
          </div>
          <ol>
            {[
              [
                "01",
                "Kenali usaha nelayan",
                "Temukan proyek koperasi dan baca skor kelayakan serta rencana penggunaan dana.",
              ],
              [
                "02",
                "Pahami sebelum mendanai",
                "Baca prospektus dan setujui risiko melalui akun demo yang terverifikasi.",
              ],
              [
                "03",
                "Ikuti setiap perkembangannya",
                "Pantau posisi pendanaan, pencairan bertahap, dan catatan hasil usaha.",
              ],
            ].map(([n, t, d]) => (
              <li key={n}>
                <span>{n}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
                <Check size={18} />
              </li>
            ))}
          </ol>
        </section>
        <section className="landing-cta">
          <div>
            <span className="eyebrow">BERLAYAR MENUJU INDONESIA 2045</span>
            <h2>Mulai dari satu niat baik.</h2>
            <p>Coba perjalanan sebagai investor, nelayan, atau pengelola.</p>
          </div>
          <Button asChild variant="amber" size="lg">
            <Link href="/masuk">
              Coba ARTANAYA <ArrowUpRight size={19} />
            </Link>
          </Button>
        </section>
      </main>
      <footer className="public-footer">
        <Brand />
        <p>
          Mode Demo · Seluruh identitas, efek, dan saldo bersifat fiktif.
          <br />
          Bukan layanan investasi atau transaksi keuangan riil.
        </p>
        <span>© 2026 ARTANAYA</span>
      </footer>
    </div>
  );
}
