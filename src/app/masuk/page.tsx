import Image from "next/image";
import { Brand } from "@/components/brand";
import { AuthForm } from "@/components/auth-form";
import { photos } from "@/lib/imagery";
import Link from "next/link";
export default function Login() {
  return (
    <main id="main" className="auth-layout">
      <section className="auth-art">
        <Image
          src={photos.fishing.src}
          alt={photos.fishing.alt}
          fill
          priority
          sizes="50vw"
        />
        <Brand light />
        <div>
          <span className="eyebrow">BERLAYAR. BERTUMBUH. BERSAMA.</span>
          <h2>
            Dari laut yang luas,
            <br />
            untuk harapan
            <br />
            yang tak terbatas.
          </h2>
          <p>
            Kepercayaan menghubungkan kita.
            <br />
            Kolaborasi menggerakkan masa depan.
          </p>
        </div>
        <small>ARTANAYA · DIGITAL TRUST INFRASTRUCTURE</small>
      </section>
      <section className="auth-content">
        <div className="mobile-brand">
          <Brand />
        </div>
        <div className="auth-form">
          <AuthForm />
        </div>
        <small className="auth-disclaimer">
          Identitas dan saldo fiktif. Tidak ada transaksi uang riil.{" "}
          <Link href="/kredit-foto">Kredit foto</Link>
        </small>
      </section>
    </main>
  );
}
