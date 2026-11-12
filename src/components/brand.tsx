import Link from "next/link";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="ARTANAYA beranda"
    >
      <svg
        width="39"
        height="39"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="2" />
        <path
          d="M24 8v23M23 12L12 29h11M27 15l10 14H27"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M11 32h27l-6 6H18z" fill="currentColor" />
        <path
          d="M8 39c5-4 8 3 16 0s11 3 17-1"
          stroke="#e8b967"
          strokeWidth="2"
        />
      </svg>
      <span>
        ARTANAYA<small>BERLAYAR. BERTUMBUH. BERSAMA.</small>
      </span>
    </Link>
  );
}
