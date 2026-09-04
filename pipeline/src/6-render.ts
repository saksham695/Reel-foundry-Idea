/**
 * Stage 6 — render. Remotion ships its own ffmpeg, so this needs nothing installed.
 */
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, renderDir, slugArg } from "./lib/paths.ts";

const slug = slugArg();
const dir = renderDir(slug);

/**
 * `--3d` renders the Reel3D composition, which composites a rigged 3D character
 * over the same footage. It needs the ANGLE GL renderer (set in remotion.config.ts);
 * without it every WebGL context fails to create and the render dies at frame 0.
 */
const use3d = process.argv.includes("--3d");
const composition = use3d ? "Reel3D" : "Reel";
const out = path.join(dir, `${slug}${use3d ? "-3d" : ""}.mp4`);

console.log(`[6/6] render  ${slug}  (${composition})`);
const result = spawnSync(
  "npx",
  ["remotion", "render", "src/remotion/index.ts", composition, out,
   `--props=${path.join(dir, "props.json")}`, ...(use3d ? ["--gl=angle"] : [])],
  { cwd: ROOT, stdio: "inherit" },
);
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`\n  ${path.relative(ROOT, out)}`);
console.log(`  Watch it. Would you post this to your own account? That is the whole gate.`);
