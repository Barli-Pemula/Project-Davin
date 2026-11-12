import { spawnSync } from "node:child_process";

const setup = spawnSync(process.execPath, ["scripts/setup-demo.mjs"], {
  stdio: "inherit",
});
if (setup.status !== 0) process.exit(setup.status ?? 1);

const next = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--webpack"], {
  stdio: "inherit",
});
process.exit(next.status ?? 1);
