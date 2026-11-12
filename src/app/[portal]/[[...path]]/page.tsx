import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/access";
import { rolePath } from "@/lib/utils";
import { loadPortal } from "@/lib/portal";
import { Shell } from "@/components/shell";
import { PortalContent } from "@/components/portal-content";
export const dynamic = "force-dynamic";
export default async function PortalPage({
  params,
}: {
  params: Promise<{ portal: string; path?: string[] }>;
}) {
  const { portal, path = [] } = await params;
  if (
    !["investor", "nelayan", "admin", "koperasi", "fasilitator"].includes(
      portal,
    )
  )
    notFound();
  const user = await currentUser();
  if (!user) redirect("/masuk");
  if (rolePath[user.role] !== "/" + portal) redirect(rolePath[user.role]);
  const valid =
    portal === "investor"
      ? ["", "pendanaan", "portofolio", "keamanan", "profil"]
      : portal === "nelayan"
        ? ["", "proyek", "dompetku", "profil"]
        : portal === "admin"
          ? [
              "",
              "verifikasi",
              "pengajuan",
              "laporan",
              "ledger",
              "radar",
              "pengaturan",
            ]
          : [""];
  if (
    !valid.includes(path[0] ?? "") ||
    path.length > 2 ||
    (path.length === 2 &&
      !(
        (portal === "investor" && path[0] === "pendanaan") ||
        (portal === "nelayan" && path[0] === "proyek")
      ))
  )
    notFound();
  const data = await loadPortal(user);
  if (
    portal === "investor" &&
    path[1] &&
    !data.offerings.some((o) => o.slug === path[1])
  )
    notFound();
  if (
    portal === "nelayan" &&
    path[1] &&
    path[1] !== "baru" &&
    !data.projects.some((p) => p.id === path[1])
  )
    notFound();
  return (
    <Shell data={data}>
      <PortalContent data={data} path={path} />
    </Shell>
  );
}
