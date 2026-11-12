import "dotenv/config";
import { mkdirSync, closeSync, openSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL?.startsWith("file:")) {
  throw new Error("Demo lokal memerlukan DATABASE_URL file: seperti di .env.example.");
}
const databaseName = process.env.DATABASE_URL.match(/^file:\.\.\/\.local-demo\/([a-zA-Z0-9_-]+\.db)$/)?.[1];
if (!databaseName) throw new Error("Gunakan file SQLite di .local-demo seperti .env.example.");
mkdirSync(".local-demo", { recursive: true });
closeSync(openSync(`.local-demo/${databaseName}`, "a"));
for (const [program, args] of [
  ["node_modules/prisma/build/index.js", ["db", "push"]],
]) {
  const result = spawnSync(process.execPath, [program, ...args], {
    stdio: "inherit",
    env: { ...process.env, DEMO_MODE: "true" },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const db = new PrismaClient();
try {
  for (const table of ["Journal", "JournalLine", "Audit"]) {
    for (const operation of ["UPDATE", "DELETE"]) {
      await db.$executeRawUnsafe(
        `CREATE TRIGGER IF NOT EXISTS immutable_${table}_${operation} BEFORE ${operation} ON "${table}" BEGIN SELECT RAISE(ABORT, 'Append-only record'); END`,
      );
    }
  }
} finally {
  await db.$disconnect();
}
const seed = spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "prisma/seed.ts"], {
  stdio: "inherit",
  env: { ...process.env, DEMO_MODE: "true" },
});
if (seed.status !== 0) process.exit(seed.status ?? 1);
