import "dotenv/config";
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import path from "node:path";
const directory = path.resolve(".local-postgres");
const port = Number(
  new URL(process.env.DATABASE_URL || "postgresql://localhost:55432/artanaya")
    .port || 55432,
);
const pg = new EmbeddedPostgres({
  databaseDir: directory,
  user: "artanaya",
  password: "artanaya_local",
  port,
  persistent: true,
  initdbFlags: ["--locale=C", "--encoding=UTF8"],
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: (msg) => console.error(String(msg)),
});
if (!existsSync(path.join(directory, "PG_VERSION"))) await pg.initialise();
await pg.start();
const client = pg.getPgClient();
await client.connect();
const found = await client.query(
  "SELECT 1 FROM pg_database WHERE datname = 'artanaya'",
);
if (!found.rowCount) await pg.createDatabase("artanaya");
await client.end();
console.log(
  `PostgreSQL ARTANAYA aktif di 127.0.0.1:${port}. Data persisten; Ctrl+C untuk berhenti.`,
);
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await pg.stop();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 60000);
