/**
 * Stage 6 — render. Remotion ships its own ffmpeg, so this needs nothing installed.
 */
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, renderDir, slugArg } from "./lib/paths.ts";

const slug = slugArg();
const dir = renderDir(slug);
const out = path.join(dir, `${slug}.mp4`);

console.log(`[6/6] render  ${slug}`);
const result = spawnSync(
  "npx",
  ["remotion", "render", "src/remotion/index.ts", "Reel", out, `--props=${path.join(dir, "props.json")}`],
  { cwd: ROOT, stdio: "inherit" },
);
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`\n  ${path.relative(ROOT, out)}`);
console.log(`  Watch it. Would you post this to your own account? That is the whole gate.`);
