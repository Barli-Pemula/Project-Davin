import "dotenv/config";
import { mkdirSync, closeSync, openSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { schemaPath } from "./prisma-schema.mjs";

const local = process.env.DATABASE_URL.startsWith("file:");
if (local) {
  const databaseName = process.env.DATABASE_URL.match(
    /^file:\.\.\/\.local-demo\/([a-zA-Z0-9_-]+\.db)$/,
  )?.[1];
  if (!databaseName)
    throw new Error("Gunakan file SQLite di .local-demo seperti .env.example.");
  mkdirSync(".local-demo", { recursive: true });
  closeSync(openSync(`.local-demo/${databaseName}`, "a"));
}
for (const args of [
  ["generate", "--schema", schemaPath],
  [
    ...(local ? ["db", "push"] : ["migrate", "deploy"]),
    "--schema",
    schemaPath,
    ...(local ? ["--skip-generate"] : []),
  ],
]) {
  const result = spawnSync(
    process.execPath,
    ["node_modules/prisma/build/index.js", ...args],
    {
      stdio: "inherit",
    },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}
if (local) {
  const { PrismaClient } = await import("@prisma/client");
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
}
const seed = spawnSync(
  process.execPath,
  ["node_modules/tsx/dist/cli.mjs", "prisma/seed.ts"],
  {
    stdio: "inherit",
  },
);
if (seed.status !== 0) process.exit(seed.status ?? 1);
