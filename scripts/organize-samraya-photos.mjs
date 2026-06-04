/**
 * @deprecated Use scripts/build-samraya-photos.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const script = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "build-samraya-photos.mjs",
);
spawnSync(process.execPath, [script], { stdio: "inherit" });
