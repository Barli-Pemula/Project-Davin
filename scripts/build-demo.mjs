import "dotenv/config";
import { spawnSync } from "node:child_process";
import { schemaPath } from "./prisma-schema.mjs";

if (process.env.VERCEL) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32 || secret.includes("replace-with"))
    throw new Error(
      "AUTH_SECRET Vercel belum valid. Isi string acak minimal 32 karakter di Environment Variables.",
    );
  if (process.env.DEMO_MODE !== "true")
    throw new Error(
      "Atur DEMO_MODE=true di Environment Variables Vercel agar akun demo tersedia.",
    );
}

const steps = process.env.VERCEL
  ? [["scripts/setup-demo.mjs"]]
  : [
      [
        "node_modules/prisma/build/index.js",
        "generate",
        "--schema",
        schemaPath,
      ],
    ];
steps.push(["node_modules/next/dist/bin/next", "build", "--webpack"]);
for (const args of steps) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
