import "dotenv/config";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

if (!process.env.DATABASE_URL?.startsWith("file:")) {
  throw new Error("Pengujian integrasi memerlukan SQLite lokal.");
}
mkdirSync(".local-demo", { recursive: true });
const env = {
  ...process.env,
  DATABASE_URL: "file:../.local-demo/artanaya_test.db",
  DEMO_MODE: "true",
};
execFileSync(process.execPath, ["scripts/setup-demo.mjs"], { env, stdio: "inherit" });
execFileSync(process.execPath, ["--import", "tsx", "tests/integration.ts"], {
  env,
  stdio: "inherit",
});
