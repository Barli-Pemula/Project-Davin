import { NextResponse } from "next/server";
import { currentUser } from "@/lib/access";
import { execute } from "@/lib/actions";
import { DomainError } from "@/lib/domain";
import { serialize } from "@/lib/utils";
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (!origin || new URL(origin).host !== new URL(request.url).host)
      return NextResponse.json(
        { error: "Asal permintaan tidak diizinkan." },
        { status: 403 },
      );
    const user = await currentUser();
    if (!user)
      return NextResponse.json(
        { error: "Silakan masuk kembali." },
        { status: 401 },
      );
    const { action, data, key } = await request.json();
    const result = await execute(user.id, action, data, key);
    return NextResponse.json(serialize({ ok: true, ...result }));
  } catch (error) {
    if (error instanceof DomainError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    console.error(
      "ARTANAYA action failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Permintaan belum berhasil. Coba lagi dengan data yang sama." },
      { status: 500 },
    );
  }
}
