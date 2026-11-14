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
          <span className="eyebrow">RUANG KERJA ARTANAYA</span>
          <h2>
            Rencana usaha,
            <br />
            pendanaan, dan
            <br />
            laporan di satu tempat.
          </h2>
          <p>
            Pilih akun nelayan, investor, atau admin untuk mencoba alur demo.
          </p>
        </div>
        <small>ARTANAYA · PEMBIAYAAN MARITIM · MODE DEMO</small>
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
