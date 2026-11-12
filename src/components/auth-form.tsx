"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Fish,
  Landmark,
  ShieldCheck,
  Users,
  Wallet,
  LoaderCircle,
} from "lucide-react";
import { Button } from "./ui/button";
export function AuthForm({
  register = false,
  initialRole = "investor",
}: {
  register?: boolean;
  initialRole?: string;
}) {
  const [selected, setSelected] = useState(initialRole);
  const [email, setEmail] = useState(register ? "" : "investor@artanaya.demo");
  const [password, setPassword] = useState(register ? "" : "ArtaDemo!2026");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      if (register) {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fd.get("name"),
            email,
            password,
            role: selected === "nelayan" ? "NELAYAN" : "INVESTOR",
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
      }
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error === "CredentialsSignin")
        throw new Error(
          "Email atau kata sandi belum sesuai, atau batas percobaan tercapai. Silakan coba lagi.",
        );
      if (!result || result.error || !result.ok)
        throw new Error(
          "Layanan masuk sedang tidak tersedia. Silakan coba lagi beberapa saat.",
        );
      window.location.assign(register ? "/verifikasi" : "/portal");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Tidak dapat terhubung. Coba lagi.",
      );
      setBusy(false);
    }
  }
  return (
    <>
      <span className="badge amber">Mode Demo</span>
      <h1>{register ? "Mulai perjalanan Anda." : "Selamat datang kembali."}</h1>
      <p className="muted">
        {register
          ? "Buat akun dengan identitas fiktif untuk menjelajahi demo."
          : "Satu langkah lebih dekat dengan masa depan pesisir."}
      </p>
      <div className="role-picker">
        {(register
          ? ([
              ["investor", "Investor", Wallet],
              ["nelayan", "Nelayan", Fish],
            ] as const)
          : ([
              ["investor", "Investor", Wallet],
              ["nelayan", "Nelayan", Fish],
              ["admin", "Admin", ShieldCheck],
              ["koperasi", "Koperasi", Landmark],
              ["fasilitator", "Fasilitator", Users],
            ] as const)
        ).map(([id, label, Icon]) => (
          <button
            type="button"
            className={selected === id ? "selected" : ""}
            key={id}
            onClick={() => {
              setSelected(id);
              if (!register) {
                setEmail(`${id}@artanaya.demo`);
                setPassword("ArtaDemo!2026");
              }
            }}
          >
            <Icon size={19} />
            {label}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="form-stack">
        {register && (
          <label>
            Nama lengkap fiktif
            <input
              name="name"
              placeholder="Nama Anda"
              required
              minLength={3}
              autoComplete="name"
            />
          </label>
        )}
        <label>
          Alamat email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Kata sandi
          <div className="password-field">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={register ? 10 : 8}
              autoComplete={register ? "new-password" : "current-password"}
              required
            />
            <button
              type="button"
              aria-label={
                show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
              }
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        {error && (
          <div role="alert" className="notice error">
            {error}
          </div>
        )}
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? <LoaderCircle className="spin" size={18} /> : null}
          {busy
            ? "Memproses…"
            : register
              ? "Buat akun demo"
              : "Masuk ke ARTANAYA"}
          <ArrowRight size={18} />
        </Button>
      </form>
      {!register && (
        <div className="demo-credentials">
          <ShieldCheck size={18} />
          <p>
            <strong>Akun demo siap dicoba</strong>
            <br />
            Pilih peran di atas. Kata sandi: <code>ArtaDemo!2026</code>
          </p>
        </div>
      )}
      <p className="auth-bottom">
        {register ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
        <Link href={register ? "/masuk" : "/daftar"}>
          {register ? "Masuk" : "Daftar sekarang"}
        </Link>
      </p>
    </>
  );
}
