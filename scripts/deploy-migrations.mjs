import "dotenv/config";
import { spawnSync } from "node:child_process";
import { schemaPath } from "./prisma-schema.mjs";

if (process.env.DATABASE_URL.startsWith("file:"))
  throw new Error("db:deploy hanya untuk PostgreSQL hosted. Lokal memakai db:setup.");

const migrationUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL;
if (new URL(migrationUrl).hostname.includes("-pooler"))
  throw new Error("Migrasi memerlukan URL PostgreSQL langsung, bukan pooler.");

const result = spawnSync(
  process.execPath,
  [
    "node_modules/prisma/build/index.js",
    "migrate",
    "deploy",
    "--schema",
    schemaPath,
  ],
  { stdio: "inherit", env: { ...process.env, DATABASE_URL: migrationUrl } },
);
process.exit(result.status ?? 1);
