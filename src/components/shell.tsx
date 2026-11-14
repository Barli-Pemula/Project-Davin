"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Compass,
  BriefcaseBusiness,
  ShieldCheck,
  UserRound,
  BookOpen,
  LogOut,
  ArrowUpRight,
  Wallet,
  ClipboardList,
  FileCheck2,
  Link2,
  Radar,
  Settings2,
  Bell,
  Anchor,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Brand } from "./brand";
import { Button } from "./ui/button";
import type { PortalData } from "@/lib/portal";
const roleLabels = {
  INVESTOR: "Investor",
  NELAYAN: "Nelayan",
  ADMIN: "Administrator",
};
const navigation = {
  INVESTOR: [
    ["/investor", "Beranda", LayoutDashboard],
    ["/investor/pendanaan", "Jelajahi pendanaan", Compass],
    ["/investor/portofolio", "Portofolio saya", BriefcaseBusiness],
    ["/investor/keamanan", "Pusat keamanan", ShieldCheck],
    ["/investor/profil", "Profil saya", UserRound],
  ],
  NELAYAN: [
    ["/nelayan", "Beranda", LayoutDashboard],
    ["/nelayan/proyek", "Proyek saya", ClipboardList],
    ["/nelayan/dompetku", "Dompetku", Wallet],
    ["/nelayan/profil", "Profil saya", UserRound],
  ],
  ADMIN: [
    ["/admin", "Ringkasan", LayoutDashboard],
    ["/admin/verifikasi", "Verifikasi identitas", FileCheck2],
    ["/admin/pengajuan", "Pengajuan & dana", ClipboardList],
    ["/admin/laporan", "Laporan usaha", BriefcaseBusiness],
    ["/admin/ledger", "Ledger & audit", Link2],
    ["/admin/radar", "Fraud Radar", Radar],
    ["/admin/pengaturan", "Pendampingan", Settings2],
  ],
} as const;
export function Shell({
  data,
  children,
}: {
  data: PortalData;
  children: ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const items = navigation[data.user.role];
  const isAdmin = data.user.role === "ADMIN";
  const active = (href: string) =>
    path === href || (href !== items[0][0] && path.startsWith(href + "/"));
  return (
    <div className={`app-shell ${isAdmin ? "admin-shell" : ""}`}>
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <Brand />
          <button
            className="mobile-close"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-label">
          <span className="dot" /> RUANG{" "}
          {roleLabels[data.user.role].toUpperCase()}
        </div>
        <nav aria-label="Navigasi utama">
          {items.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={active(href) ? "active" : ""}
              aria-current={active(href) ? "page" : undefined}
            >
              <Icon size={20} />
              <span>{label}</span>
              {active(href) && <i />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-extra">
          <span className="nav-label">BELAJAR & BERTUMBUH</span>
          <Link href="/edukasi">
            <BookOpen size={20} />
            Pusat edukasi
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="sidebar-note">
          <div className="icon-box">
            <Anchor size={20} />
          </div>
          <h4>Pahami prosesnya.</h4>
          <p>Pelajari pengajuan, penawaran, dan risiko dana simulasi.</p>
          <Link href="/edukasi">
            Baca panduan <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="sidebar-user">
          <span className="avatar">
            {data.user.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")}
          </span>
          <div>
            <strong>{data.user.name}</strong>
            <small>{roleLabels[data.user.role]}</small>
          </div>
          <button
            title="Keluar akun"
            aria-label="Keluar akun"
            onClick={() => signOut({ callbackUrl: "/masuk" })}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      {open && (
        <button
          className="nav-backdrop"
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="app-body">
        <header className="app-header">
          <div className="header-location">
            <button
              className="menu-toggle"
              aria-label="Buka menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={22} />
            </button>
            <span>
              Ruang {roleLabels[data.user.role]}{" "}
              <span className="crumb">/</span>{" "}
              <strong>
                {items.find(([href]) => active(href))?.[1] ?? "Detail"}
              </strong>
            </span>
          </div>
          <div className="header-right">
            <span className="badge amber">Mode Demo</span>
            <Link
              href={
                isAdmin
                  ? "/admin/radar"
                  : data.user.role === "INVESTOR"
                    ? "/investor/keamanan"
                    : "/edukasi"
              }
              className="notification"
              aria-label="Lihat pemberitahuan"
            >
              <Bell size={20} />
              {data.alerts.some((a) => a.status !== "SELESAI") && <i />}
            </Link>
            <span className="avatar small">{data.user.name[0]}</span>
          </div>
        </header>
        <main id="main" className="app-main">
          {children}
          <footer className="app-footer">
            <span>ARTANAYA · Berlayar. Bertumbuh. Bersama.</span>
            <span>Seluruh dana & transaksi adalah simulasi.</span>
            <Link href="/kredit-foto">Kredit foto</Link>
          </footer>
        </main>
      </div>
      <nav className="bottom-nav" aria-label="Navigasi seluler">
        {items.slice(0, 4).map(([href, label, Icon]) => (
          <Link key={href} href={href} className={active(href) ? "active" : ""}>
            <Icon size={21} />
            <span>
              {label
                .replace("Jelajahi pendanaan", "Pendanaan")
                .replace("Portofolio saya", "Portofolio")
                .replace("Pusat keamanan", "Keamanan")
                .replace("Profil saya", "Profil")
                .replace("Verifikasi identitas", "Verifikasi")
                .replace("Pengajuan & dana", "Pengajuan")}
            </span>
          </Link>
        ))}
        <Button variant="ghost" onClick={() => setOpen(true)}>
          <Menu size={21} />
          <span>Lainnya</span>
        </Button>
      </nav>
    </div>
  );
}
