import { currentUser } from "@/lib/access";
import { db } from "@/lib/db";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await currentUser();
  if (!user) return new Response("Silakan masuk.", { status: 401 });
  const { id } = await params;
  const d = await db.document.findUnique({
    where: { id },
    include: { project: true, report: { include: { project: true } } },
  });
  if (!d) return new Response("Dokumen tidak ditemukan.", { status: 404 });
  const allowed =
    d.ownerId === user.id ||
    user.role === "ADMIN";
  if (!allowed)
    return new Response("Anda tidak memiliki akses.", { status: 403 });
  return new Response(d.bytes, {
    headers: {
      "Content-Type": d.mime,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(d.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
