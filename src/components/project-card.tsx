import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowUpRight, ShieldCheck, Clock3 } from "lucide-react";
import { rupiah, statusLabel } from "@/lib/utils";
import type { PortalData } from "@/lib/portal";
import { projectPhoto } from "@/lib/imagery";
export type Offer = PortalData["offerings"][number];
export function ProjectCard({ offer, now }: { offer: Offer; now: string }) {
  const percent = Math.min(
    100,
    Math.round((Number(offer.raised) / Number(offer.target)) * 100),
  );
  const score = offer.project.scores[0];
  const days = Math.max(
    0,
    Math.ceil(
      (new Date(offer.closesAt).getTime() - new Date(now).getTime()) / 86400000,
    ),
  );
  return (
    <article className="project-card">
      <Link
        className="project-picture"
        href={`/investor/pendanaan/${offer.slug}`}
      >
        <Image
          src={projectPhoto(offer.project.category).src}
          width={800}
          height={480}
          alt={`${projectPhoto(offer.project.category).alt}; foto ilustrasi proyek demo`}
        />
        <span className="category-badge">
          {offer.project.category === "TANGKAP"
            ? "Perikanan tangkap"
            : "Budidaya"}
        </span>
        <span className="image-status">
          <ShieldCheck size={13} /> Foto ilustrasi · Data demo
        </span>
      </Link>
      <div className="project-card-body">
        <div className="project-meta">
          <span>
            <MapPin size={13} />
            {offer.project.location}
          </span>
          <span className="mini-score">
            {score?.score?.toFixed(0) ?? "—"}
            <small>SKOR</small>
          </span>
        </div>
        <h3>
          <Link href={`/investor/pendanaan/${offer.slug}`}>
            {offer.project.title}
          </Link>
        </h3>
        <p className="issuer">{offer.project.cooperative.name}</p>
        <div className="project-scenario">
          <span>Contoh hasil per tahun</span>
          <strong>
            {offer.scenarioBps / 100}% <small>ilustratif</small>
          </strong>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progres pendanaan"
        >
          <span style={{ width: percent + "%" }} />
        </div>
        <div className="funding-caption">
          <strong>{rupiah(offer.raised)}</strong>
          <span>{percent}%</span>
        </div>
        <small className="muted">dari target {rupiah(offer.target)}</small>
        <div className="project-card-bottom">
          <span>
            <Clock3 size={14} />
            {offer.status === "AKTIF"
              ? `${days} hari lagi`
              : statusLabel(offer.status)}
          </span>
          <Link href={`/investor/pendanaan/${offer.slug}`}>
            Lihat proyek <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
