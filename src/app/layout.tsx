import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "ARTANAYA — Berlayar. Bertumbuh. Bersama.",
    template: "%s | ARTANAYA",
  },
  description:
    "Demo pembiayaan maritim inklusif melalui koperasi dan crowdfunding syariah. Jelajahi usaha nelayan, pahami risiko, dan ikuti dampaknya.",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12333d",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          Lewati ke konten
        </a>
        {children}
      </body>
    </html>
  );
}
