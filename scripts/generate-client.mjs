import "dotenv/config";
import { spawnSync } from "node:child_process";
import { schemaPath } from "./prisma-schema.mjs";

const result = spawnSync(
  process.execPath,
  ["node_modules/prisma/build/index.js", "generate", "--schema", schemaPath],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
