import { readFileSync, writeFileSync } from "node:fs";

const url = process.env.DATABASE_URL;
if (!url)
  throw new Error(
    "DATABASE_URL belum diatur. Isi .env untuk lokal atau Environment Variables di Vercel.",
  );

const local = url.startsWith("file:");
const hosted = /^postgres(?:ql)?:\/\//.test(url);
if (!local && !hosted)
  throw new Error(
    "DATABASE_URL harus berupa file: SQLite lokal atau postgresql:// database hosted.",
  );
if (local && process.env.VERCEL)
  throw new Error(
    "Vercel memerlukan DATABASE_URL PostgreSQL hosted; file SQLite lokal tidak persisten di Vercel.",
  );

export const schemaPath = hosted
  ? "prisma/schema.postgres.generated.prisma"
  : "prisma/schema.prisma";

if (hosted) {
  const source = readFileSync("prisma/schema.prisma", "utf8");
  const schema = source.replace(
    'provider = "sqlite"',
    'provider = "postgresql"',
  );
  if (source === schema)
    throw new Error("Datasource SQLite tidak ditemukan dalam schema Prisma.");
  writeFileSync(schemaPath, schema);
}
