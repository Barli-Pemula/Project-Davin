import { NextResponse } from "next/server";
import { currentUser } from "@/lib/access";
import { db } from "@/lib/db";
import { DomainError, ensure } from "@/lib/domain";
export async function POST(request: Request) {
  try {
    ensure(
      request.headers.get("origin") &&
        new URL(request.headers.get("origin")!).host ===
          new URL(request.url).host,
      "Asal permintaan tidak diizinkan.",
      403,
    );
    const user = await currentUser();
    ensure(user, "Silakan masuk.", 401);
    ensure(
      ["NELAYAN", "INVESTOR"].includes(user.role),
      "Anda tidak memiliki akses.",
      403,
    );
    const form = await request.formData();
    const file = form.get("file");
    const kind = String(form.get("kind"));
    const context = String(form.get("context") ?? "");
    ensure(
      file instanceof File && file.size > 0 && file.size <= 2 * 1024 * 1024,
      "Ukuran dokumen harus 1 byte–2 MB.",
    );
    ensure(
      ["KYC", "PROJECT", "REPORT"].includes(kind),
      "Jenis dokumen tidak valid.",
    );
    if (kind === "PROJECT") {
      const p = await db.project.findUnique({ where: { id: context } });
      ensure(p?.ownerId === user.id, "Proyek berada di luar akses Anda.", 403);
      ensure(
        ["DRAF", "PERLU_REVISI", "PERLU_PEMBINAAN"].includes(p.status),
        "Dokumen proyek sudah masuk proses tinjauan.",
      );
    }
    if (kind === "REPORT") {
      const r = await db.report.findUnique({
        where: { id: context },
        include: { project: true },
      });
      ensure(
        r?.project.ownerId === user.id,
        "Laporan berada di luar akses Anda.",
        403,
      );
      ensure(
        ["DIAJUKAN", "PERLU_REVISI"].includes(r.status),
        "Laporan sudah divalidasi.",
      );
    }
    if (kind === "KYC") ensure(!user.verified, "Verifikasi sudah selesai.");
    const bytes = Buffer.from(await file.arrayBuffer());
    const mime =
      bytes.subarray(0, 5).toString() === "%PDF-"
        ? "application/pdf"
        : bytes
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          ? "image/png"
          : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
            ? "image/jpeg"
            : null;
    ensure(
      mime && mime === file.type,
      "Dokumen harus berupa PDF, PNG, atau JPEG yang valid.",
    );
    const document = await db.document.create({
      data: {
        ownerId: user.id,
        kind,
        name: file.name.replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 120),
        mime,
        bytes,
        size: bytes.length,
        ...(kind === "PROJECT"
          ? { projectId: context }
          : kind === "REPORT"
            ? { reportId: context }
            : {}),
      },
    });
    return NextResponse.json({
      id: document.id,
      message: "Dokumen fiktif tersimpan secara privat.",
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof DomainError
            ? e.message
            : "Unggah gagal. Silakan coba lagi.",
      },
      { status: e instanceof DomainError ? e.status : 500 },
    );
  }
}
