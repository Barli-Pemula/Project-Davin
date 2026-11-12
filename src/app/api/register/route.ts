import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
export async function POST(request: Request) {
  try {
    if (
      !request.headers.get("origin") ||
      new URL(request.headers.get("origin")!).host !== new URL(request.url).host
    )
      return NextResponse.json(
        { error: "Asal permintaan tidak diizinkan." },
        { status: 403 },
      );
    const parsed = z
      .object({
        name: z.string().trim().min(3).max(100),
        email: z.email().transform((s) => s.toLowerCase()),
        password: z.string().min(10).max(128),
        role: z.enum(["INVESTOR", "NELAYAN"]),
      })
      .safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        {
          error:
            "Lengkapi nama, email valid, dan kata sandi minimal 10 karakter.",
        },
        { status: 400 },
      );
    const d = parsed.data;
    const passwordHash = await hash(d.password, 12);
    await db.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name: d.name,
          email: d.email,
          passwordHash,
          role: d.role,
          kyc: { create: {} },
        },
      });
      await tx.account.create({
        data: { key: `wallet:${u.id}`, kind: "USER_WALLET", userId: u.id },
      });
      if (d.role === "NELAYAN" && process.env.DEMO_MODE === "true") {
        const coop = await tx.cooperative.findFirst({
          where: { active: true },
        });
        if (coop)
          await tx.membership.create({
            data: { userId: u.id, cooperativeId: coop.id },
          });
      }
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "Pendaftaran gagal. Email mungkin sudah digunakan. Coba masuk atau gunakan email demo lain.",
      },
      { status: 400 },
    );
  }
}
