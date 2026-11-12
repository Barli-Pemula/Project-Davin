"use client";
import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Plus,
  Wallet,
  BriefcaseBusiness,
  TrendingUp,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Sprout,
  FileText,
  Download,
  CheckCircle2,
  LockKeyhole,
  Radar,
  Waves,
  Fish,
  ClipboardList,
  Users,
  ChevronRight,
  Landmark,
  Info,
  Anchor,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  ActionForm,
  ActionButton,
  Dialog,
  UploadForm,
  useAction,
} from "./actions-ui";
import { ProjectCard, type Offer } from "./project-card";
import type { PortalData } from "@/lib/portal";
import { rupiah, dateID, statusLabel, rolePath } from "@/lib/utils";
import type { Signals } from "@/lib/scoring";
type Props = { data: PortalData };
type Project = PortalData["projects"][number];
export function Heading({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
function Empty({
  text = "Belum ada data untuk ditampilkan.",
  children,
}: {
  text?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <Anchor size={30} />
      <h3>Perjalanan baru dimulai.</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
function Tag({ status }: { status: string }) {
  const good = [
    "AKTIF",
    "TERVERIFIKASI",
    "SUKSES",
    "VALID",
    "BERJALAN",
    "TERKONFIRMASI",
    "DICAIRKAN",
    "DISETUJUI",
    "SELESAI",
    "Tinggi",
  ].includes(status);
  const bad = [
    "GAGAL",
    "PERLU_REVISI",
    "PERLU_PEMBINAAN",
    "TINJAUAN_MANUAL",
  ].includes(status);
  return (
    <span className={`badge ${good ? "green" : bad ? "amber" : "neutral"}`}>
      {statusLabel(status)}
    </span>
  );
}
function Stat({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        {label}
        <span>{icon}</span>
      </div>
      <strong title={value}>
        <span className="stat-full">{value}</span>
        <span className="stat-short">
          {value.startsWith("Rp") && Number(value.replace(/\D/g, "")) >= 1000000
            ? `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(Number(value.replace(/\D/g, "")) / 1000000)} jt`
            : value.startsWith("Rp") && Number(value.replace(/\D/g, "")) >= 1000
              ? `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Number(value.replace(/\D/g, "")) / 1000)} rb`
              : value}
        </span>
      </strong>
      <small>{detail}</small>
    </div>
  );
}
function Topup() {
  return (
    <Dialog
      title="Tambah saldo simulasi"
      trigger={
        <>
          <Plus size={17} /> Top-up demo
        </>
      }
    >
      <p className="muted">Mode Demo · Tidak ada uang riil yang ditagihkan.</p>
      <ActionForm action="wallet.topup" label="Tambah saldo simulasi" confirm>
        <label>
          Nominal rupiah
          <input
            name="amount"
            type="number"
            min={50000}
            max={1000000000}
            step={50000}
            defaultValue={500000}
            required
          />
        </label>
        <label className="checkbox-label">
          <input type="checkbox" name="simulateFailure" value="true" />
          Uji pembayaran gagal (saldo tidak berubah)
        </label>
      </ActionForm>
    </Dialog>
  );
}
function Transactions({ data, ledger = false }: Props & { ledger?: boolean }) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <h2>
          {ledger ? "Smart Contract Ledger Demo" : "Aktivitas dana terbaru"}
        </h2>
        <span className="badge neutral">
          {ledger ? "SHA-256 · internal" : "Saldo Simulasi"}
        </span>
      </div>
      {ledger && (
        <p className="muted">
          Jurnal database berpasangan. Hash berisi referensi internal tanpa data
          identitas. Bukan jaringan blockchain.
        </p>
      )}
      {data.transactions.length === 0 ? (
        <Empty text="Mutasi saldo akan muncul setelah ada transaksi." />
      ) : (
        <div className="transaction-list">
          {data.transactions.map((t) => {
            const own = t.lines
              .filter((l) => l.accountId === data.wallet?.id)
              .reduce((n, l) => n + BigInt(l.amount), 0n);
            return (
              <div className="transaction-row" key={t.id}>
                <span className={`transaction-icon ${own < 0n ? "out" : ""}`}>
                  {own < 0n ? (
                    <ArrowUpRight size={18} />
                  ) : (
                    <ArrowRight size={18} />
                  )}
                </span>
                <div className="transaction-info">
                  <strong>{statusLabel(t.type)}</strong>
                  <small>
                    {dateID(t.createdAt)} · {t.reference.slice(-8)}
                  </small>
                  {ledger && <code className="hash">{t.hash}</code>}
                </div>
                <div className="transaction-amount">
                  <strong className={own >= 0n ? "positive" : ""}>
                    {ledger
                      ? rupiah(
                          t.lines
                            .filter((l) => BigInt(l.amount) > 0n)
                            .reduce((n, l) => n + BigInt(l.amount), 0n),
                        )
                      : (own > 0n ? "+" : "") + rupiah(own)}
                  </strong>
                  <small>
                    {ledger ? `${t.lines.length} baris · seimbang` : "Tercatat"}
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function Catalog({ data, compact = false }: Props & { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("SEMUA");
  const offers = data.offerings.filter(
    (o) =>
      (category === "SEMUA" || o.project.category === category) &&
      `${o.project.title} ${o.project.location}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>
            {compact
              ? "Peluang baik dari pesisir"
              : "Temukan pendanaan yang berarti"}
          </h2>
          <p>Kenali usahanya. Pahami risikonya. Tumbuh bersama.</p>
        </div>
        {compact && (
          <Link href="/investor/pendanaan" className="text-link">
            Lihat semua <ArrowRight size={16} />
          </Link>
        )}
      </div>
      <div className="catalog-toolbar">
        <div className="search-input">
          <Search size={18} />
          <input
            aria-label="Cari proyek atau lokasi"
            placeholder="Cari proyek atau lokasi…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <SlidersHorizontal size={18} />
        </div>
        <div className="filter-tabs">
          {[
            ["SEMUA", "Semua proyek"],
            ["BUDIDAYA", "Budidaya"],
            ["TANGKAP", "Perikanan tangkap"],
          ].map(([v, t]) => (
            <button
              key={v}
              onClick={() => setCategory(v)}
              className={category === v ? "active" : ""}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="project-grid">
        {(compact ? offers.slice(0, 3) : offers).map((o) => (
          <ProjectCard key={o.id} offer={o} now={data.now} />
        ))}
      </div>
      {offers.length === 0 && (
        <Empty text="Tidak ada proyek yang cocok. Coba kata kunci atau kategori lain." />
      )}
    </>
  );
}
function InvestorHome({ data }: Props) {
  const total = data.orders
    .filter((o) => o.status === "TERKONFIRMASI")
    .reduce((n, o) => n + BigInt(o.amount), 0n);
  const income = data.transactions
    .filter((t) => t.type === "HASIL_INVESTOR")
    .flatMap((t) => t.lines)
    .filter((l) => l.accountId === data.wallet?.id)
    .reduce((n, l) => n + BigInt(l.amount), 0n);
  return (
    <>
      <Heading
        title={`Selamat datang, ${data.user.name.split(" ")[0]}.`}
        subtitle="Setiap pendanaan, selangkah menuju pesisir yang lebih sejahtera."
      >
        <span className="date-chip">{dateID(data.now)}</span>
      </Heading>
      {!data.user.verified && (
        <div className="notice">
          <Info size={18} />
          Selesaikan verifikasi sebelum melakukan pendanaan.{" "}
          <Link href="/verifikasi">Verifikasi sekarang</Link>
        </div>
      )}
      <div className="overview-grid">
        <section className="portfolio-hero">
          <div className="portfolio-hero-copy">
            <span className="hero-kicker">
              <span className="dot" /> PORTOFOLIO BERDAMPAK
            </span>
            <h2>
              Modal Anda.
              <br />
              <em>Harapan untuk pesisir.</em>
            </h2>
            <p>
              Dukung usaha nelayan melalui pendanaan
              <br className="desktop-only" /> yang transparan dan berlandaskan
              syariah.
            </p>
            <Link href="/investor/pendanaan">
              Temukan peluang pendanaan <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="portfolio-hero-art">
            <Image
              src="/coast.svg"
              alt="Perahu layar di lautan"
              fill
              sizes="(max-width: 760px) 40vw, 30vw"
              priority
            />
          </div>
          <span className="hero-watermark">BERSAMA, KITA TUMBUH.</span>
        </section>
        <section className="wallet-card">
          <div className="wallet-title">
            <span className="icon-box">
              <Wallet size={20} />
            </span>
            <span>
              Dompet investasi<small>Saldo Simulasi</small>
            </span>
            <ShieldCheck size={17} />
          </div>
          <strong className="wallet-balance">
            {rupiah(data.wallet?.balance ?? "0")}
          </strong>
          <p>Siap untuk langkah baik berikutnya.</p>
          <Topup />
          <small className="wallet-note">
            <LockKeyhole size={12} />
            Dana fiktif, khusus demonstrasi
          </small>
        </section>
      </div>
      <div className="stats-grid three">
        <Stat
          label="Total pendanaan Anda"
          value={rupiah(total)}
          detail="Posisi pesanan terkonfirmasi"
          icon={<BriefcaseBusiness size={18} />}
        />
        <Stat
          label="Usaha yang Anda dukung"
          value={String(
            new Set(
              data.orders
                .filter((o) => o.status === "TERKONFIRMASI")
                .map((o) => o.offeringId),
            ).size,
          ).padStart(2, "0")}
          detail="Proyek nelayan melalui koperasi"
          icon={<Sprout size={18} />}
        />
        <Stat
          label="Realisasi bagi hasil"
          value={rupiah(income)}
          detail="Hasil tervalidasi, bukan estimasi"
          icon={<TrendingUp size={18} />}
        />
      </div>
      <div className="dashboard-lower">
        <div>
          <Catalog data={data} compact />
        </div>
        <aside className="right-rail">
          <SecurityCard data={data} />
          <div className="learning-card">
            <span className="icon-box">
              <Waves size={22} />
            </span>
            <span className="eyebrow">BEKAL SEBELUM BERLAYAR</span>
            <h3>
              Sudah kenal
              <br />
              akad mudharabah?
            </h3>
            <p>
              Pahami peran koperasi, risiko, dan cara pembagian hasil usaha.
            </p>
            <Link href="/edukasi">
              Belajar sebentar <ArrowUpRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
      <div className="bottom-trust">
        <ShieldCheck size={18} />
        <span>
          <strong>Transparan di setiap langkah.</strong> Dana simulasi tercatat
          dalam ledger dan penawaran ditinjau admin.
        </span>
        <Link href="/edukasi">
          Pelajari <ArrowRight size={15} />
        </Link>
      </div>
    </>
  );
}
function SecurityCard({ data }: Props) {
  const count = data.alerts.filter((a) => a.status !== "SELESAI").length;
  return (
    <div className="security-card">
      <div className="panel-heading">
        <h3>Radar keamanan</h3>
        <span className="badge neutral">Demo</span>
      </div>
      <div className="radar-visual">
        <div />
        <div />
        <div />
        <ShieldCheck size={32} />
        <i />
      </div>
      <h3>
        {data.user.locked
          ? "Self-Lock aktif"
          : count
            ? `${count} sinyal demo terpantau`
            : "Tidak ada alert terbuka"}
      </h3>
      <p>
        Simulasi pemantauan aktivitas akun. Tidak membaca lokasi atau biometrik
        nyata.
      </p>
      <Link className="text-link" href="/investor/keamanan">
        Lihat pusat keamanan <ArrowRight size={15} />
      </Link>
    </div>
  );
}
function OfferingDetail({ data, offer }: Props & { offer: Offer }) {
  const p = offer.prospectuses.find((p) => p.version === offer.activeVersion)!;
  const score = offer.project.scores[0];
  const active =
    offer.status === "AKTIF" && new Date(offer.closesAt) > new Date(data.now);
  return (
    <>
      <Link className="text-link back-link" href="/investor/pendanaan">
        <ArrowLeft size={16} />
        Kembali ke pendanaan
      </Link>
      <Heading
        eyebrow="PENDANAAN USAHA PESISIR"
        title={offer.project.title}
        subtitle={`${offer.project.location} · ${offer.project.cooperative.name}`}
      >
        <Tag status={offer.status} />
      </Heading>
      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-image">
            <Image
              src={
                offer.project.category === "TANGKAP"
                  ? "/fishing.svg"
                  : "/seaweed.svg"
              }
              width={800}
              height={480}
              alt={offer.project.title}
              priority
            />
          </div>
          <div className="panel">
            <div className="panel-heading">
              <h2>Tentang usaha ini</h2>
              <span className="badge green">
                Skor {score?.score?.toFixed(1) ?? "—"} · {score?.classification}
              </span>
            </div>
            <p>{offer.project.plan}</p>
            <div className="info-grid">
              <div>
                <small>Penerbit efek demo</small>
                <strong>{offer.project.cooperative.name}</strong>
              </div>
              <div>
                <small>Penerima manfaat</small>
                <strong>{offer.project.owner.name}</strong>
              </div>
              <div>
                <small>Periode penawaran</small>
                <strong>
                  {dateID(offer.opensAt)} – {dateID(offer.closesAt)}
                </strong>
              </div>
              <div>
                <small>Skenario hasil tahunan</small>
                <strong>
                  {offer.scenarioBps / 100}% · ilustrasi, bukan jaminan
                </strong>
              </div>
            </div>
          </div>
          <div className="panel" id="prospektus">
            <div className="panel-heading">
              <h2>
                <FileText size={21} /> Prospektus demo
              </h2>
              <span className="badge neutral">Versi {p.version}</span>
            </div>
            <p>{p.content}</p>
            <h3>Penggunaan dana</h3>
            <p>{p.proceeds}</p>
            <div className="notice amber">
              <Info size={20} />
              <div>
                <strong>Kenali risikonya</strong>
                <p>{p.risk}</p>
              </div>
            </div>
            <small className="muted">
              ID persetujuan: {p.id}. Versi ini akan dicatat bersama pembelian
              Anda.
            </small>
          </div>
          <ScorePanel score={score} />
        </div>
        <aside>
          <div className="panel purchase-panel">
            <span className="badge amber">Mode Demo</span>
            <h2>Mulai langkah baik Anda.</h2>
            <strong className="large-money">{rupiah(offer.raised)}</strong>
            <p className="muted">terkumpul dari {rupiah(offer.target)}</p>
            <div className="progress-track">
              <span
                style={{
                  width:
                    Math.min(
                      100,
                      (Number(offer.raised) / Number(offer.target)) * 100,
                    ) + "%",
                }}
              />
            </div>
            <div className="split-row">
              <span>Saldo Simulasi</span>
              <strong>{rupiah(data.wallet?.balance ?? "0")}</strong>
            </div>
            {active ? (
              <ActionForm
                action="offering.buy"
                data={{ id: offer.id, prospectusId: p.id }}
                label="Konfirmasi pembelian demo"
              >
                <label>
                  Nominal pendanaan
                  <input
                    type="number"
                    name="amount"
                    min={50000}
                    max={Number(offer.target) - Number(offer.raised)}
                    step={Number(offer.unitPrice)}
                    defaultValue={50000}
                    required
                  />
                  <small>
                    Minimum Rp50.000 · kelipatan {rupiah(offer.unitPrice)}
                  </small>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="accepted"
                    value="true"
                    required
                  />
                  Saya telah membaca prospektus v{p.version}, memahami risiko,
                  dan menyetujui pembelian efek simulasi koperasi.
                </label>
                <details className="test-options">
                  <summary>Opsi pengujian demo</summary>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="simulateFailure"
                      value="true"
                    />
                    Simulasikan pembayaran gagal
                  </label>
                </details>
              </ActionForm>
            ) : (
              <div className="notice">
                Penawaran sudah ditutup. {statusLabel(offer.status)}.
              </div>
            )}
            <div className="topup-inline">
              <Topup />
            </div>
            <p className="fine-print">
              <ShieldCheck size={14} />
              Dana masuk ke escrow simulasi. Hasil usaha dapat berbeda dari
              skenario.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
function Portfolio({ data }: Props) {
  return (
    <>
      <Heading
        title="Portofolio saya"
        subtitle="Ikuti usaha yang Anda dukung, dari pendanaan hingga realisasi."
      />
      <div className="panel">
        <h2>Posisi pendanaan</h2>
        {!data.orders.length ? (
          <Empty text="Temukan proyek pertama untuk memulai perjalanan Anda.">
            <Link href="/investor/pendanaan" className="btn btn-primary">
              Jelajahi pendanaan
            </Link>
          </Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Usaha & pesanan</th>
                  <th>Nominal</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Penawaran</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/investor/pendanaan/${o.offering.slug}`}>
                        <strong>{o.offering.project.title}</strong>
                      </Link>
                      <small>
                        {dateID(o.acceptedAt)} · {o.id.slice(-8)}
                      </small>
                    </td>
                    <td>{rupiah(o.amount)}</td>
                    <td>{o.units}</td>
                    <td>
                      <Tag status={o.status} />
                    </td>
                    <td>
                      <Tag status={o.offering.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Transactions data={data} />
    </>
  );
}
function Security({ data }: Props) {
  return (
    <>
      <Heading
        title="Pusat keamanan"
        subtitle="Kendali akun ada di tangan Anda. Semua sinyal pada radar ini bersifat fiktif."
      />
      <div className="two-column">
        <SecurityCard data={data} />
        <div className="panel">
          <h2>
            <LockKeyhole size={22} /> Kunci mandiri · Self-Lock
          </h2>
          <p>
            Kunci akun untuk memblokir top-up dan pembelian di server. Buka
            kembali dengan verifikasi ulang demo.
          </p>
          <Tag status={data.user.locked ? "TERKUNCI" : "AKTIF"} />
          <ActionForm
            action="security.lock"
            data={{ locked: !data.user.locked }}
            label={
              data.user.locked ? "Verifikasi & buka akun" : "Aktifkan Self-Lock"
            }
            variant={data.user.locked ? "default" : "destructive"}
            confirm
          >
            {data.user.locked && (
              <label>
                Kode MFA demo
                <input
                  name="code"
                  placeholder="123456"
                  pattern="123456"
                  required
                />
                <small>Kode simulasi: 123456. Tidak ada SMS dikirim.</small>
              </label>
            )}
          </ActionForm>
        </div>
      </div>
      <div className="panel">
        <h2>Aktivitas radar demo</h2>
        {data.alerts.map((a) => (
          <div className="alert-row" key={a.id}>
            <span className="icon-box">
              <Radar size={20} />
            </span>
            <div>
              <strong>{a.type}</strong>
              <p>
                {dateID(a.createdAt)} · Tingkat {a.severity.toLowerCase()}
              </p>
              {a.note && <p>{a.note}</p>}
            </div>
            <Tag status={a.status} />
          </div>
        ))}
      </div>
      <div className="panel">
        <h2>Riwayat keamanan & tindakan</h2>
        {data.audits.slice(0, 10).map((a) => (
          <div className="audit-row" key={a.id}>
            <CheckCircle2 size={16} />
            <div>
              <strong>{statusLabel(a.action)}</strong>
              <p>{a.detail}</p>
            </div>
            <small>{dateID(a.createdAt)}</small>
          </div>
        ))}
      </div>
    </>
  );
}
export function Profile({ data }: Props) {
  return (
    <>
      <Heading
        title={data.user.verified ? "Profil saya" : "Verifikasi akun demo"}
        subtitle="Gunakan identitas fiktif. MFA dan liveness di sini adalah simulasi."
      />
      <div className="profile-banner">
        <span className="avatar large">
          {data.user.name
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")}
        </span>
        <div>
          <h2>{data.user.name}</h2>
          <p>{data.user.email}</p>
          <Tag status={data.kyc?.status ?? "DRAF"} />
        </div>
        <span className="badge amber">Mode Demo</span>
      </div>
      <div className="two-column">
        <div className="panel">
          <h2>Data & status akun</h2>
          <div className="info-grid">
            <div>
              <small>Lokasi</small>
              <strong>{data.user.location}</strong>
            </div>
            <div>
              <small>Peran</small>
              <strong>{statusLabel(data.user.role)}</strong>
            </div>
            {data.user.kusuka && (
              <div>
                <small>KUSUKA fiktif</small>
                <strong>{data.user.kusuka}</strong>
              </div>
            )}
            <div>
              <small>Identitas</small>
              <strong>
                {data.user.verified
                  ? "Terverifikasi demo"
                  : "Menunggu verifikasi"}
              </strong>
            </div>
          </div>
          {data.kyc?.reason && (
            <div className="notice">Catatan admin: {data.kyc.reason}</div>
          )}
          <DocLinks documents={data.documents} />
          {!data.user.verified && <UploadForm kind="KYC" />}
        </div>
        <div className="panel">
          {!data.user.verified ? (
            <>
              <h2>Lengkapi verifikasi</h2>
              <div className="stepper">
                <span className="active">1 · Data diri</span>
                <span>2 · Simulasi</span>
                <span>3 · Tinjauan</span>
              </div>
              <ActionForm action="kyc.submit" label="Kirim verifikasi demo">
                <label>
                  Nama lengkap fiktif
                  <input
                    name="name"
                    defaultValue={data.user.name}
                    minLength={3}
                    required
                  />
                </label>
                <label>
                  Lokasi
                  <input
                    name="location"
                    defaultValue={data.user.location}
                    required
                  />
                </label>
                {data.user.role === "NELAYAN" && (
                  <label>
                    KUSUKA fiktif
                    <input
                      name="kusuka"
                      placeholder="DEMO-123456"
                      pattern="DEMO-.*"
                      required
                    />
                  </label>
                )}
                <label>
                  Kode MFA demo
                  <input
                    name="code"
                    placeholder="123456"
                    pattern="123456"
                    required
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    name="liveness"
                    type="checkbox"
                    value="true"
                    required
                  />
                  Jalankan liveness simulasi: lulus. Kamera tidak digunakan.
                </label>
              </ActionForm>
            </>
          ) : (
            <>
              <ShieldCheck className="profile-shield" size={48} />
              <h2>Siap melangkah bersama.</h2>
              <p>
                Identitas demo Anda telah ditinjau. Jelajahi fitur sesuai peran
                dan pantau setiap perkembangan.
              </p>
              <Button asChild>
                <Link href={rolePath[data.user.role]}>
                  Kembali ke dasbor <ArrowRight size={16} />
                </Link>
              </Button>
              <hr />
              <Link className="text-link" href="/edukasi">
                Pusat edukasi & bantuan <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
function DocLinks({
  documents,
}: {
  documents: { id: string; name: string }[];
}) {
  return (
    <div className="document-links">
      {documents.map((d) => (
        <a
          key={d.id}
          href={`/api/documents/${d.id}`}
          target="_blank"
          rel="noreferrer"
        >
          <FileText size={16} />
          <span>{d.name}</span>
          <Download size={15} />
        </a>
      ))}
    </div>
  );
}
function ScorePanel({
  score,
}: {
  score: Offer["project"]["scores"][number] | undefined;
}) {
  if (!score)
    return (
      <div className="notice">
        Skor dihitung di server setelah proyek diajukan.
      </div>
    );
  const signals = score.signals as Signals;
  const weights = score.weights as Record<string, number>;
  return (
    <div className="panel">
      <div className="panel-heading">
        <h2>Skor kelayakan usaha</h2>
        <Tag status={score.classification} />
      </div>
      <div className="score-overview">
        <strong>
          {score.score?.toFixed(1) ?? "—"}
          <small>/100</small>
        </strong>
        <div>
          {score.newcomer && <span className="badge amber">Nelayan Baru</span>}
          <p>{score.reason}</p>
        </div>
      </div>
      <div className="score-signals">
        {Object.entries({
          T: "Transaksi 90 hari",
          P: "Produksi 6 bulan",
          K: "Keanggotaan",
          L: "Legalitas",
          R: "Riwayat akad",
        }).map(([key, title]) => (
          <div key={key}>
            <span>{title}</span>
            <div className="progress-track">
              <span
                style={{ width: `${signals[key as keyof Signals] ?? 0}%` }}
              />
            </div>
            <strong>{signals[key as keyof Signals] ?? "—"}</strong>
            <small>{((weights[key] ?? 0) * 100).toFixed(1)}%</small>
          </div>
        ))}
      </div>
      <p className="fine-print">
        {score.version} · {score.source}. Bobot di kanan merupakan bobot
        efektif. Data ternormalisasi fiktif, bukan skor kredit produksi.
      </p>
    </div>
  );
}
function FisherHome({ data }: Props) {
  return (
    <>
      <Heading
        title={`Selamat berlayar, ${data.user.name.split(" ")[0]}.`}
        subtitle="Kelola usaha, ajukan modal, dan pantau perkembangan Anda."
      >
        <Button asChild>
          <Link href="/nelayan/proyek/baru">
            <Plus size={18} />
            Ajukan proyek
          </Link>
        </Button>
      </Heading>
      {!data.user.verified && (
        <div className="notice">
          Akun belum terverifikasi.{" "}
          <Link href="/verifikasi">Lengkapi verifikasi KUSUKA demo</Link>
        </div>
      )}
      <div className="stats-grid three">
        <Stat
          label="Saldo Dompetku"
          value={rupiah(data.wallet?.balance ?? "0")}
          detail="Saldo Simulasi · dana diterima"
          icon={<Wallet size={18} />}
        />
        <Stat
          label="Proyek usaha saya"
          value={String(data.projects.length)}
          detail="Seluruh pengajuan tersimpan"
          icon={<Fish size={18} />}
        />
        <Stat
          label="Proyek berjalan"
          value={String(
            data.projects.filter((p) => p.status === "BERJALAN").length,
          )}
          detail="Pantau jadwal laporan & pencairan"
          icon={<TrendingUp size={18} />}
        />
      </div>
      <ProjectList data={data} />
      <AssignmentNotes data={data} />
    </>
  );
}
function ProjectList({ data }: Props) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <h2>Usaha & pengajuan saya</h2>
        <Link href="/nelayan/proyek/baru" className="text-link">
          <Plus size={16} />
          Proyek baru
        </Link>
      </div>
      {!data.projects.length ? (
        <Empty text="Ajukan rencana usaha pertama melalui koperasi Anda." />
      ) : (
        data.projects.map((p) => (
          <Link
            className="project-list-row"
            href={`/nelayan/proyek/${p.id}`}
            key={p.id}
          >
            <span className="icon-box">
              {p.category === "TANGKAP" ? (
                <Fish size={24} />
              ) : (
                <Sprout size={24} />
              )}
            </span>
            <div>
              <h3>{p.title}</h3>
              <p>
                {p.location} · {rupiah(p.requested)}
              </p>
              {p.reason && <small className="review-note">{p.reason}</small>}
            </div>
            <Tag status={p.status} />
            <ChevronRight size={18} />
          </Link>
        ))
      )}
    </div>
  );
}
function ProjectEditor({ data, project }: Props & { project?: Project }) {
  const { run, busy, feedback } = useAction();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const ref = useRef<HTMLFormElement>(null);
  const sig = project?.signals as Signals | undefined;
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const signals = Object.fromEntries(
      ["T", "P", "K", "L", "R"].map((k) => [
        k,
        f.get(k) === "" ? null : Number(f.get(k)),
      ]),
    );
    const r = await run("project.save", {
      ...Object.fromEntries(f),
      signals,
      id: project?.id,
    });
    if (r?.id) router.push(`/nelayan/proyek/${r.id}`);
  }
  function next() {
    const fields = ref.current?.querySelectorAll<HTMLFormElement>(
      'fieldset[data-step="1"] input, fieldset[data-step="1"] select',
    );
    if (fields && Array.from(fields).every((el) => el.reportValidity()))
      setStep(2);
  }
  return (
    <div className="panel editor-panel">
      <div className="stepper">
        <span className={step === 1 ? "active" : ""}>1 · Tentang usaha</span>
        <span className={step === 2 ? "active" : ""}>2 · Rencana & data</span>
        <span>3 · Dokumen & kirim</span>
      </div>
      <form ref={ref} className="form-stack" onSubmit={save}>
        <fieldset data-step="1" hidden={step !== 1}>
          <legend>Kenali usaha Anda</legend>
          <label>
            Nama proyek
            <input
              name="title"
              minLength={5}
              maxLength={120}
              defaultValue={project?.title}
              placeholder="Contoh: Budidaya Rumput Laut Segara"
              required
            />
          </label>
          <div className="form-grid">
            <label>
              Kategori
              <select
                name="category"
                defaultValue={project?.category ?? "BUDIDAYA"}
              >
                <option value="BUDIDAYA">Budidaya</option>
                <option value="TANGKAP">Perikanan tangkap</option>
              </select>
            </label>
            <label>
              Lokasi usaha
              <input
                name="location"
                defaultValue={project?.location ?? data.user.location}
                minLength={3}
                required
              />
            </label>
          </div>
          <label>
            Koperasi penerbit
            <select
              name="cooperativeId"
              defaultValue={project?.cooperativeId}
              required
            >
              {data.cooperatives.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Modal yang dibutuhkan (rupiah)
            <input
              type="number"
              name="requested"
              min={50000}
              max={1000000000}
              step={50000}
              defaultValue={project?.requested ?? 5000000}
              required
            />
          </label>
          <Button type="button" onClick={next}>
            Lanjut ke rencana usaha <ArrowRight size={16} />
          </Button>
        </fieldset>
        <fieldset hidden={step !== 2}>
          <legend>Rencana & sinyal usaha</legend>
          <label>
            Rencana usaha
            <textarea
              name="plan"
              minLength={20}
              maxLength={4000}
              rows={5}
              defaultValue={project?.plan}
              placeholder="Jelaskan kebutuhan sarana, operasional, penggunaan dana, dan jadwal usaha."
              required
            />
          </label>
          <div className="notice">
            <Info size={18} />
            Input skor ternormalisasi 0–100 untuk simulasi. Kosong berbeda dari
            nol. Kosongkan R untuk nelayan baru.
          </div>
          <div className="signal-inputs">
            {Object.entries({
              T: "Transaksi",
              P: "Produksi",
              K: "Koperasi",
              L: "Legalitas",
              R: "Riwayat akad",
            }).map(([k, t]) => (
              <label key={k}>
                {k} · {t}
                <input
                  type="number"
                  name={k}
                  min={0}
                  max={100}
                  step="any"
                  defaultValue={sig?.[k as keyof Signals] ?? ""}
                  placeholder="Belum ada"
                />
              </label>
            ))}
          </div>
          <div className="button-row">
            <Button variant="outline" type="button" onClick={() => setStep(1)}>
              <ArrowLeft size={16} />
              Kembali
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Menyimpan…" : "Simpan draf & lanjutkan"}
            </Button>
          </div>
        </fieldset>
        {feedback}
      </form>
    </div>
  );
}
function Agreement({ offer, role }: { offer: Offer; role: string }) {
  const a = offer.agreement;
  if (!a) return null;
  const signed = role === "NELAYAN" ? a.fisherSignedAt : a.coopSignedAt;
  return (
    <div className="panel">
      <div className="panel-heading">
        <h2>Akad mudharabah</h2>
        <Tag status={a.status} />
      </div>
      <p>
        Perjanjian terpisah antara koperasi dan nelayan. Nisbah laba: koperasi{" "}
        {a.coopBps / 100}% · nelayan {a.fisherBps / 100}%. Efek investor
        mengikuti prospektus koperasi.
      </p>
      <div className="info-grid">
        <div>
          <small>Persetujuan nelayan</small>
          <strong>
            {a.fisherSignedAt
              ? dateID(a.fisherSignedAt)
              : "Belum ditandatangani"}
          </strong>
        </div>
        <div>
          <small>Persetujuan koperasi</small>
          <strong>
            {a.coopSignedAt ? dateID(a.coopSignedAt) : "Belum ditandatangani"}
          </strong>
        </div>
      </div>
      {!signed && offer.publishedAt && (
        <ActionForm
          action="agreement.sign"
          data={{ id: a.id, accepted: true }}
          label="Setujui akad demo"
          confirm
        />
      )}
      <h3>Jadwal pencairan</h3>
      {a.stages.map((s) => (
        <div className="stage-row" key={s.id}>
          <span className="step-number">{s.number}</span>
          <div>
            <strong>{s.title}</strong>
            <small>
              {s.number === 1
                ? "Setelah akad aktif & escrow dilepas"
                : "Setelah tahap pertama dan laporan valid"}
            </small>
          </div>
          <strong>{rupiah(s.amount)}</strong>
          <Tag status={s.status} />
        </div>
      ))}
      <p className="fine-print">
        Setoran dan laporan hasil usaha dicatat per periode panen yang diisi
        nelayan. Distribusi dijalankan setelah laporan tervalidasi.
      </p>
    </div>
  );
}
function FisherDetail({ data, project }: Props & { project: Project }) {
  const [edit, setEdit] = useState(false);
  const editable = ["DRAF", "PERLU_REVISI", "PERLU_PEMBINAAN"].includes(
    project.status,
  );
  const offer = data.offerings.find((o) => o.projectId === project.id);
  return (
    <>
      <Link href="/nelayan/proyek" className="text-link back-link">
        <ArrowLeft size={16} />
        Proyek saya
      </Link>
      <Heading title={project.title} subtitle={project.location}>
        <Tag status={project.status} />
      </Heading>
      {project.reason && (
        <div className="notice amber">
          <Info size={20} />
          <div>
            <strong>Catatan tinjauan</strong>
            <p>{project.reason}</p>
          </div>
        </div>
      )}
      <div className="two-column">
        <div>
          <div className="panel">
            <h2>Rencana usaha</h2>
            <p>{project.plan}</p>
            <div className="info-grid">
              <div>
                <small>Kebutuhan modal</small>
                <strong>{rupiah(project.requested)}</strong>
              </div>
              <div>
                <small>Koperasi</small>
                <strong>{project.cooperative.name}</strong>
              </div>
            </div>
            <DocLinks documents={project.documents} />
            {editable && (
              <>
                <UploadForm kind="PROJECT" context={project.id} />
                <ActionForm
                  action="project.submit"
                  data={{ id: project.id }}
                  label="Ajukan untuk penilaian"
                  confirm
                />
                <Button variant="outline" onClick={() => setEdit(!edit)}>
                  {edit ? "Tutup editor" : "Perbaiki draf"}
                </Button>
              </>
            )}
          </div>
          {edit && <ProjectEditor data={data} project={project} />}
          <ScorePanel score={project.scores[0]} />
        </div>
        <div>
          {offer && <Agreement offer={offer} role="NELAYAN" />}
          {project.status === "BERJALAN" && (
            <div className="panel">
              <h2>Kirim laporan usaha</h2>
              <p>
                Gunakan periode yang sama untuk memperbaiki laporan yang
                dikembalikan.
              </p>
              <ActionForm
                action="report.submit"
                data={{ projectId: project.id }}
                label="Kirim laporan"
              >
                <label>
                  Periode laporan
                  <input
                    name="period"
                    placeholder="Contoh: Panen demo 02"
                    required
                    minLength={3}
                  />
                </label>
                <div className="form-grid">
                  <label>
                    Progres (%)
                    <input
                      type="number"
                      name="progress"
                      min={0}
                      max={100}
                      defaultValue={50}
                      required
                    />
                  </label>
                  <label>
                    Dana digunakan (Rp)
                    <input
                      type="number"
                      name="used"
                      min={0}
                      defaultValue={500000}
                      required
                    />
                  </label>
                </div>
                <label>
                  Hasil usaha bersih (Rp)
                  <input
                    type="number"
                    name="result"
                    defaultValue={1000000}
                    required
                  />
                  <small>
                    Nilai positif = laba; 0 = impas; negatif = rugi.
                  </small>
                </label>
                <label>
                  Catatan progres & penggunaan
                  <textarea name="note" minLength={20} required rows={3} />
                </label>
              </ActionForm>
            </div>
          )}
        </div>
      </div>
      {project.reports.length > 0 && (
        <div className="panel">
          <h2>Laporan & bukti usaha</h2>
          {project.reports.map((r) => (
            <div className="report-item" key={r.id}>
              <div className="panel-heading">
                <h3>{r.period}</h3>
                <Tag status={r.status} />
              </div>
              <p>{r.note}</p>
              <p>
                Progres {r.progress}% · Digunakan {rupiah(r.used)} · Hasil{" "}
                {rupiah(r.result)}
              </p>
              {r.reason && <p className="review-note">{r.reason}</p>}
              <DocLinks documents={r.documents} />
              {["DIAJUKAN", "PERLU_REVISI"].includes(r.status) && (
                <UploadForm kind="REPORT" context={r.id} />
              )}
              <span className="muted">
                {r.distributions.length
                  ? "Bagi hasil periode ini telah dicatat."
                  : "Belum ada distribusi hasil."}
              </span>
            </div>
          ))}
        </div>
      )}
      <AssignmentNotes data={data} />
    </>
  );
}
function AssignmentNotes({ data }: Props) {
  if (!data.assignments.length) return null;
  return (
    <div className="panel">
      <h2>Pendampingan Karang Taruna</h2>
      {data.assignments.map((a) => (
        <div className="report-item" key={a.id}>
          <strong>
            {a.fisher.name} · Pendamping: {a.facilitator.name}
          </strong>
          {a.notes.map((n) => (
            <div className="note-item" key={n.id}>
              <p>{n.body}</p>
              <small>{dateID(n.createdAt)}</small>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
function AdminHome({ data }: Props) {
  return (
    <>
      <Heading
        eyebrow="PUSAT OPERASIONAL ARTANAYA"
        title={`Selamat bertugas, ${data.user.name.split(" ")[0]}.`}
        subtitle="Tinjau dengan cermat. Jaga kepercayaan di setiap langkah."
      />
      <div className="admin-hero">
        <div>
          <span className="eyebrow">DANA PADA PENAWARAN SUKSES & AKTIF</span>
          <h2>
            {rupiah(
              data.offerings
                .filter((o) => ["AKTIF", "SUKSES"].includes(o.status))
                .reduce((n, o) => n + BigInt(o.raised), 0n),
            )}
          </h2>
          <p>Saldo Simulasi · data dari jurnal dan penawaran</p>
        </div>
        <ShieldCheck size={70} />
      </div>
      <div className="stats-grid three">
        <Stat
          label="Antrean verifikasi"
          value={String(
            data.kycQueue.filter((k) => k.status === "DIAJUKAN").length,
          )}
          detail="Berkas identitas memerlukan tinjauan"
          icon={<ShieldCheck size={18} />}
        />
        <Stat
          label="Pengajuan baru"
          value={String(
            data.projects.filter((p) => p.status === "DIAJUKAN").length,
          )}
          detail="Tinjau skor dan dokumen usaha"
          icon={<ClipboardList size={18} />}
        />
        <Stat
          label="Alert terbuka"
          value={String(
            data.alerts.filter((a) => a.status !== "SELESAI").length,
          )}
          detail="Sinyal geofencing & liveness demo"
          icon={<Radar size={18} />}
        />
      </div>
      <div className="quick-links">
        {[
          [
            "/admin/verifikasi",
            "Tinjau identitas",
            "Validasi berkas dan verifikasi demo",
            ShieldCheck,
          ],
          [
            "/admin/pengajuan",
            "Kelola pengajuan & dana",
            "Publikasi, escrow, dan pencairan",
            ClipboardList,
          ],
          [
            "/admin/laporan",
            "Validasi hasil usaha",
            "Tinjau laporan & distribusi laba",
            TrendingUp,
          ],
        ].map(([href, title, desc, Icon]) => {
          const I = Icon as typeof ShieldCheck;
          return (
            <Link key={String(href)} href={String(href)} className="panel">
              <I size={25} />
              <h3>{String(title)}</h3>
              <p>{String(desc)}</p>
              <ArrowUpRight size={18} />
            </Link>
          );
        })}
      </div>
      <AuditPanel data={data} />
    </>
  );
}
function AuditPanel({ data }: Props) {
  return (
    <div className="panel">
      <div className="panel-heading">
        <h2>Jejak audit terbaru</h2>
        <span className="badge neutral">Log server</span>
      </div>
      {data.audits.map((a) => (
        <div className="audit-row" key={a.id}>
          <CheckCircle2 size={17} />
          <div>
            <strong>{a.action}</strong>
            <p>{a.detail}</p>
            <small>Referensi {a.entityId}</small>
          </div>
          <small>{dateID(a.createdAt)}</small>
        </div>
      ))}
    </div>
  );
}
function KycQueue({ data }: Props) {
  return (
    <>
      <Heading
        title="Verifikasi identitas"
        subtitle="Tinjau data fiktif dan hasil adaptor liveness/MFA demo."
      />
      {!data.kycQueue.length ? (
        <Empty text="Semua berkas sudah ditinjau." />
      ) : (
        data.kycQueue.map((k) => (
          <div className="panel" key={k.id}>
            <div className="panel-heading">
              <h2>{k.user.name}</h2>
              <Tag status={k.status} />
            </div>
            <p>
              {k.user.email} · {statusLabel(k.user.role)}
            </p>
            <p>
              Liveness: {k.liveness} · MFA: {k.mfa ? "Lulus demo" : "Belum"}
            </p>
            <DocLinks documents={k.user.documents} />
            {k.status === "DIAJUKAN" && (
              <ReviewForm
                action="kyc.review"
                id={k.id}
                label="Simpan keputusan verifikasi"
              />
            )}
            {k.reason && <div className="notice">{k.reason}</div>}
          </div>
        ))
      )}
    </>
  );
}
function ReviewForm({
  action,
  id,
  label,
}: {
  action: string;
  id: string;
  label: string;
}) {
  return (
    <ActionForm action={action} data={{ id }} label={label}>
      <label>
        Keputusan
        <select name="approve">
          <option value="true">Setujui / validasi</option>
          <option value="false">Kembalikan untuk perbaikan</option>
        </select>
      </label>
      <label>
        Alasan keputusan
        <textarea
          name="reason"
          minLength={5}
          maxLength={500}
          placeholder="Tuliskan dasar keputusan Anda…"
          required
          rows={2}
        />
      </label>
    </ActionForm>
  );
}
function AdminProjects({ data }: Props) {
  return (
    <>
      <Heading
        title="Pengajuan & aliran dana"
        subtitle="Skor, persetujuan, penerbitan, dan pencairan dalam satu ruang kerja."
      />
      <div className="panel">
        <h2>Antrean & riwayat proyek</h2>
        {data.projects.map((p) => (
          <details className="review-details" key={p.id}>
            <summary>
              <div>
                <strong>{p.title}</strong>
                <small>
                  {p.owner.name} · {rupiah(p.requested)}
                </small>
              </div>
              <Tag status={p.status} />
            </summary>
            <div className="review-content">
              <p>{p.plan}</p>
              <DocLinks documents={p.documents} />
              <ScorePanel score={p.scores[0]} />
              {["DIAJUKAN", "DITINJAU"].includes(p.status) && (
                <ActionForm
                  action="project.review"
                  data={{ id: p.id }}
                  label="Simpan keputusan proyek"
                >
                  <label>
                    Keputusan
                    <select name="decision">
                      <option value="DISETUJUI">Setujui</option>
                      <option value="PERLU_REVISI">Minta revisi</option>
                      <option value="PERLU_PEMBINAAN">Perlu pembinaan</option>
                    </select>
                  </label>
                  <label>
                    Alasan
                    <textarea name="reason" minLength={5} required rows={2} />
                  </label>
                </ActionForm>
              )}
              {p.reason && <div className="notice">{p.reason}</div>}
            </div>
          </details>
        ))}
      </div>
      <div className="section-heading">
        <h2>Penawaran & tahapan dana</h2>
      </div>
      {data.offerings.map((o) => (
        <div className="panel" key={o.id}>
          <div className="panel-heading">
            <h2>{o.project.title}</h2>
            <Tag status={o.status} />
          </div>
          <p>
            {rupiah(o.raised)} terkumpul / {rupiah(o.target)} · berakhir{" "}
            {dateID(o.closesAt)}
          </p>
          <details className="review-details">
            <summary>
              <strong>Prospektus & penggunaan dana</strong>
            </summary>
            <p>{o.prospectuses[0]?.content}</p>
            <p>{o.prospectuses[0]?.risk}</p>
            <p>{o.prospectuses[0]?.proceeds}</p>
          </details>
          {o.status === "DRAF" && (
            <ActionForm
              action="offering.publish"
              data={{ id: o.id }}
              label="Terbitkan penawaran"
              confirm
            >
              <label>
                Alasan verifikasi penerbit
                <input name="reason" minLength={5} required />
              </label>
            </ActionForm>
          )}
          {o.status === "AKTIF" && (
            <details className="test-options">
              <summary>Simulasi akhir periode & refund</summary>
              <ActionForm
                action="offering.expire"
                data={{ id: o.id }}
                label="Akhiri periode & refund demo"
                variant="destructive"
                confirm
              >
                <label>
                  Alasan
                  <input
                    name="reason"
                    minLength={5}
                    required
                    placeholder="Pengujian penawaran tidak mencapai target"
                  />
                </label>
              </ActionForm>
            </details>
          )}
          {o.status === "SUKSES" && !o.releasedAt && (
            <ActionForm
              action="offering.release"
              data={{ id: o.id }}
              label="Lepas escrow ke koperasi"
              confirm
            />
          )}
          {o.releasedAt && (
            <div className="notice success">
              <CheckCircle2 size={17} />
              Escrow dilepas {dateID(o.releasedAt)}
            </div>
          )}
          {o.agreement && (
            <>
              <p>
                Akad: <Tag status={o.agreement.status} /> · nelayan{" "}
                {o.agreement.fisherSignedAt ? "setuju" : "belum setuju"} ·
                koperasi {o.agreement.coopSignedAt ? "setuju" : "belum setuju"}
              </p>
              {o.agreement.stages.map((s) => (
                <details className="review-details" key={s.id}>
                  <summary>
                    <div>
                      <strong>
                        Tahap {s.number} · {s.title}
                      </strong>
                      <small>{rupiah(s.amount)}</small>
                    </div>
                    <Tag status={s.status} />
                  </summary>
                  {s.status === "DIRENCANAKAN" && (
                    <ActionForm
                      action="stage.approve"
                      data={{ id: s.id }}
                      label="Setujui tahap"
                    >
                      <label>
                        Alasan persetujuan
                        <input name="reason" minLength={5} required />
                      </label>
                    </ActionForm>
                  )}
                  {s.status === "DISETUJUI" && (
                    <ActionForm
                      action="stage.pay"
                      data={{ id: s.id }}
                      label="Cairkan ke Dompetku nelayan"
                      confirm
                    />
                  )}
                  {s.paidAt && <p>Dicairkan {dateID(s.paidAt)}</p>}
                </details>
              ))}
            </>
          )}
        </div>
      ))}
    </>
  );
}
function AdminReports({ data }: Props) {
  const reports = data.projects.flatMap((p) =>
    p.reports.map((r) => ({ ...r, title: p.title })),
  );
  return (
    <>
      <Heading
        title="Laporan & distribusi hasil"
        subtitle="Validasi bukti penggunaan dana sebelum membagikan hasil simulasi."
      />
      {!reports.length ? (
        <Empty text="Belum ada laporan usaha." />
      ) : (
        reports.map((r) => (
          <div className="panel" key={r.id}>
            <div className="panel-heading">
              <div>
                <h2>{r.title}</h2>
                <p>
                  {r.period} · progres {r.progress}%
                </p>
              </div>
              <Tag status={r.status} />
            </div>
            <p>{r.note}</p>
            <div className="info-grid">
              <div>
                <small>Penggunaan dana</small>
                <strong>{rupiah(r.used)}</strong>
              </div>
              <div>
                <small>Hasil usaha bersih</small>
                <strong>{rupiah(r.result)}</strong>
              </div>
            </div>
            <DocLinks documents={r.documents} />
            {r.status === "DIAJUKAN" && (
              <ReviewForm
                action="report.review"
                id={r.id}
                label="Simpan validasi laporan"
              />
            )}
            {r.status === "VALID" && !r.distributions.length && (
              <ActionForm
                action="report.distribute"
                data={{ id: r.id }}
                label="Distribusikan hasil demo"
                confirm
              />
            )}
            {r.status === "TINJAUAN_MANUAL" && (
              <div className="notice amber">
                Kerugian memerlukan tinjauan manual. Tidak ada distribusi
                otomatis.
              </div>
            )}
            {r.reason && <p className="review-note">{r.reason}</p>}
            {r.distributions.map((d) => (
              <div className="split-row" key={d.id}>
                <span>{statusLabel(d.type)}</span>
                <strong>{rupiah(d.amount)}</strong>
                <Tag status="SELESAI" />
              </div>
            ))}
          </div>
        ))
      )}
    </>
  );
}
function AdminRadar({ data }: Props) {
  return (
    <>
      <Heading
        title="Fraud Radar"
        subtitle="Mode Demo · sinyal geofencing dan liveness fiktif, tanpa pelacakan perangkat."
      />
      {data.alerts.map((a) => (
        <div className="panel" key={a.id}>
          <div className="panel-heading">
            <h2>
              <Radar size={21} />
              {a.type}
            </h2>
            <Tag status={a.status} />
          </div>
          <p>
            Prioritas {a.severity.toLowerCase()} · {dateID(a.createdAt)} ·
            referensi akun {a.userId}
          </p>
          <p>Penanggung jawab: {a.assignedTo ?? "Belum ditugaskan"}</p>
          {a.status !== "SELESAI" && (
            <>
              <ActionButton
                action="alert.assign"
                data={{ id: a.id }}
                label="Ambil tanggung jawab"
              />
              <ActionForm
                action="alert.resolve"
                data={{ id: a.id }}
                label="Selesaikan alert"
              >
                <label>
                  Alasan penyelesaian
                  <textarea name="reason" minLength={5} required rows={2} />
                </label>
              </ActionForm>
            </>
          )}
          {a.note && <div className="notice success">{a.note}</div>}
        </div>
      ))}
    </>
  );
}
function Assignments({ data }: Props) {
  const admin = data.user.role === "ADMIN";
  return (
    <>
      <Heading
        title={admin ? "Pengaturan pendampingan" : "Ruang fasilitator"}
        subtitle="Pendampingan untuk membuka peluang, selangkah demi selangkah."
      />
      {admin && (
        <div className="panel">
          <h2>Tugaskan fasilitator</h2>
          <ActionForm action="assignment.create" label="Simpan penugasan">
            <div className="form-grid">
              <label>
                Nelayan
                <select name="fisherId">
                  {data.people
                    .filter((p) => p.role === "NELAYAN")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Fasilitator
                <select name="facilitatorId">
                  {data.people
                    .filter((p) => p.role === "FASILITATOR")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
          </ActionForm>
        </div>
      )}
      {!data.assignments.length && (
        <Empty text="Belum ada nelayan yang ditugaskan." />
      )}
      {data.assignments.map((a) => (
        <div className="panel" key={a.id}>
          <div className="panel-heading">
            <h2>
              <Users size={22} />
              {a.fisher.name}
            </h2>
            <Tag status={a.fisher.verified ? "TERVERIFIKASI" : "DRAF"} />
          </div>
          <p>
            {a.fisher.location} · Pendamping: {a.facilitator.name}
          </p>
          {data.projects
            .filter((p) => p.ownerId === a.fisherId)
            .map((p) => (
              <div className="note-item" key={p.id}>
                <strong>{p.title}</strong>
                <p>
                  {statusLabel(p.status)} ·{" "}
                  {p.scores[0]?.classification ?? "Belum dinilai"}
                </p>
                <p>{p.scores[0]?.reason}</p>
              </div>
            ))}
          {a.notes.map((n) => (
            <div className="note-item" key={n.id}>
              <p>{n.body}</p>
              <small>{dateID(n.createdAt)}</small>
            </div>
          ))}
          {!admin && (
            <ActionForm
              action="assignment.note"
              data={{ id: a.id }}
              label="Tambahkan catatan pendampingan"
            >
              <label>
                Catatan & tindak lanjut
                <textarea
                  name="body"
                  minLength={10}
                  maxLength={2000}
                  required
                  rows={3}
                />
              </label>
            </ActionForm>
          )}
        </div>
      ))}
    </>
  );
}
function Cooperative({ data }: Props) {
  return (
    <>
      <Heading
        eyebrow="KOPERASI SEBAGAI PENERBIT"
        title="Ruang koperasi"
        subtitle="Siapkan penawaran, setujui akad, dan dampingi usaha anggota."
      />
      <div className="stats-grid three">
        <Stat
          label="Saldo Simulasi koperasi"
          value={rupiah(data.wallet?.balance ?? "0")}
          detail="Dana escrow & porsi hasil usaha"
          icon={<Wallet size={18} />}
        />
        <Stat
          label="Usaha anggota"
          value={String(data.projects.length)}
          detail="Proyek pada koperasi Anda"
          icon={<Fish size={18} />}
        />
        <Stat
          label="Penawaran"
          value={String(data.offerings.length)}
          detail="Draf, aktif, dan selesai"
          icon={<Landmark size={18} />}
        />
      </div>
      {data.projects.map((p) => (
        <div className="panel" key={p.id}>
          <div className="panel-heading">
            <h2>{p.title}</h2>
            <Tag status={p.status} />
          </div>
          <p>
            {p.owner.name} · {p.location} · {rupiah(p.requested)}
          </p>
          <p>{p.plan}</p>
          <DocLinks documents={p.documents} />
          {p.status === "DISETUJUI" && !p.offering && (
            <details className="review-details">
              <summary>Susun penawaran & prospektus</summary>
              <ActionForm
                action="offering.propose"
                data={{ projectId: p.id }}
                label="Ajukan penawaran ke admin"
              >
                <div className="form-grid">
                  <label>
                    Target (Rp)
                    <input
                      type="number"
                      name="target"
                      defaultValue={p.requested}
                      readOnly
                    />
                  </label>
                  <label>
                    Harga unit (Rp)
                    <input
                      type="number"
                      name="unitPrice"
                      min={50000}
                      defaultValue={50000}
                      step={50000}
                      required
                    />
                  </label>
                </div>
                <label>
                  Periode (hari)
                  <input
                    type="number"
                    name="days"
                    min={1}
                    max={90}
                    defaultValue={30}
                    required
                  />
                </label>
                <label>
                  Risiko penawaran
                  <textarea
                    name="risk"
                    minLength={20}
                    required
                    defaultValue="Risiko cuaca ekstrem, perubahan harga hasil laut, penyakit budidaya, dan keterlambatan operasional. Modal berisiko; hasil tidak dijamin."
                  />
                </label>
                <label>
                  Rencana penggunaan dana
                  <textarea
                    name="proceeds"
                    minLength={20}
                    required
                    defaultValue="60% untuk persiapan sarana dan 40% untuk operasional setelah laporan tervalidasi."
                  />
                </label>
                <div className="notice">
                  Aturan efek demo: 80% porsi laba koperasi dibagikan pro-rata
                  kepada investor. Nisbah akad koperasi:nelayan 60:40. Tinjau
                  aturan lengkap pada edukasi.
                </div>
              </ActionForm>
            </details>
          )}
          {p.reason && <p className="review-note">{p.reason}</p>}
        </div>
      ))}
      {data.offerings.map((o) => (
        <div key={o.id}>
          <h2 className="subsection-title">{o.project.title}</h2>
          <Agreement offer={o} role="KOPERASI" />
        </div>
      ))}
      <Transactions data={data} />
    </>
  );
}
export function PortalContent({
  data,
  path,
}: {
  data: PortalData;
  path: string[];
}) {
  const tab = path[0] ?? "";
  switch (data.user.role) {
    case "INVESTOR":
      if (tab === "pendanaan")
        return path[1] ? (
          <OfferingDetail
            data={data}
            offer={data.offerings.find((o) => o.slug === path[1])!}
          />
        ) : (
          <>
            <Heading
              title="Jelajahi pendanaan"
              subtitle="Usaha nyata dalam cerita, dana fiktif dalam demo. Mulai kenali peluangnya."
            />
            <Catalog data={data} />
          </>
        );
      if (tab === "portofolio") return <Portfolio data={data} />;
      if (tab === "keamanan") return <Security data={data} />;
      if (tab === "profil") return <Profile data={data} />;
      return <InvestorHome data={data} />;
    case "NELAYAN":
      if (tab === "profil") return <Profile data={data} />;
      if (tab === "dompetku")
        return (
          <>
            <Heading
              title="Dompetku"
              subtitle="Dana yang diterima dan seluruh mutasi usaha Anda."
            />
            <div className="admin-hero">
              <div>
                <span className="eyebrow">SALDO SIMULASI</span>
                <h2>{rupiah(data.wallet?.balance ?? "0")}</h2>
                <p>Mode Demo · dana fiktif</p>
              </div>
              <Wallet size={58} />
            </div>
            <Transactions data={data} />
            {data.offerings.map((o) => (
              <Agreement key={o.id} offer={o} role="NELAYAN" />
            ))}
          </>
        );
      if (tab === "proyek")
        return path[1] === "baru" ? (
          <>
            <Heading
              title="Ajukan proyek baru"
              subtitle="Ceritakan rencana usaha Anda. Kami mulai dari potensi, bukan agunan."
            />
            <ProjectEditor data={data} />
          </>
        ) : path[1] ? (
          <FisherDetail
            data={data}
            project={data.projects.find((p) => p.id === path[1])!}
          />
        ) : (
          <>
            <Heading
              title="Proyek saya"
              subtitle="Seluruh perjalanan usaha dalam satu tempat."
            />
            <ProjectList data={data} />
          </>
        );
      return <FisherHome data={data} />;
    case "ADMIN":
      if (tab === "verifikasi") return <KycQueue data={data} />;
      if (tab === "pengajuan") return <AdminProjects data={data} />;
      if (tab === "laporan") return <AdminReports data={data} />;
      if (tab === "radar") return <AdminRadar data={data} />;
      if (tab === "ledger")
        return (
          <>
            <Heading
              title="Ledger & audit"
              subtitle="Mode Demo · jejak transaksi dan keputusan yang dapat ditelusuri."
            />
            <Transactions data={data} ledger />
            <AuditPanel data={data} />
          </>
        );
      if (tab === "pengaturan") return <Assignments data={data} />;
      return <AdminHome data={data} />;
    case "KOPERASI":
      return <Cooperative data={data} />;
    case "FASILITATOR":
      return <Assignments data={data} />;
  }
}
