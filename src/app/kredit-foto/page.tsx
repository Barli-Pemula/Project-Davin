import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { photos } from "@/lib/imagery";

export default function PhotoCredits() {
  return (
    <>
      <header className="public-header">
        <Brand />
        <Link className="text-link" href="/">
          Kembali ke beranda
        </Link>
      </header>
      <main id="main" className="education-page photo-credits">
        <span className="eyebrow">FOTO PESISIR INDONESIA</span>
        <h1>Kredit foto</h1>
        <p>
          Foto berikut menampilkan tempat dan kegiatan nyata di Indonesia. Foto
          digunakan sebagai ilustrasi suasana; proyek, akun, dan transaksi
          ARTANAYA tetap fiktif. Tampilan foto dipangkas secara responsif.
        </p>
        <div className="photo-credit-grid">
          {Object.values(photos).map((photo) => (
            <article className="panel" key={photo.src}>
              <Image src={photo.src} alt={photo.alt} width={800} height={480} />
              <div>
                <h2>{photo.location}</h2>
                <p>
                  Foto oleh {photo.credit} · Wikimedia Commons ·{" "}
                  <a href={photo.licenseUrl}>{photo.license}</a>
                </p>
                <a href={photo.source}>Lihat foto dan sumber asli</a>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
