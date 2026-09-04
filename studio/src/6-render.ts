/**
 * Stage 6 — render. Remotion ships its own ffmpeg, so this needs nothing installed.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, renderDir, slugArg } from "./lib/paths.ts";

/**
 * Remotion prefers a system Chrome, and on this Mac that is an arm64 build while
 * Node runs x64 under Rosetta — the render then times out connecting to it.
 * Point it at the shell `npx remotion browser ensure` downloaded, which matches.
 */
function ensuredBrowser(): string | null {
  const p = path.join(
    ROOT,
    "node_modules/.remotion/chrome-headless-shell/mac-x64/chrome-headless-shell-mac-x64/chrome-headless-shell",
  );
  return fs.existsSync(p) ? p : null;
}

const slug = slugArg();
const dir = renderDir(slug);

/**
 * Never overwrite a previous cut. Each render lands as v1, v2, v3… and the newest
 * is also copied to <slug>.mp4 for convenience. Iterating on a reel means watching
 * two versions side by side, and a pipeline that clobbers the last one makes that
 * impossible.
 */
function nextVersion(): { out: string; n: number } {
  const versions = ensureVersions();
  const used = fs
    .readdirSync(versions)
    .map((f) => /^v(\d+)\.mp4$/.exec(f)?.[1])
    .filter(Boolean)
    .map(Number);
  const n = (used.length ? Math.max(...used) : 0) + 1;
  return { out: path.join(versions, `v${n}.mp4`), n };
}

function ensureVersions(): string {
  const d = path.join(dir, "versions");
  fs.mkdirSync(d, { recursive: true });
  return d;
}

const { out, n: version } = nextVersion();

console.log(`[6/6] render  ${slug}  → v${version}`);
const browser = ensuredBrowser();
const args = ["remotion", "render", "src/remotion/index.ts", "Reel", out, `--props=${path.join(dir, "props.json")}`];
if (browser) args.push(`--browser-executable=${browser}`);

const result = spawnSync("npx", args, { cwd: ROOT, stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);

// Latest cut also at the plain path, so `open <slug>.mp4` always shows newest.
const latest = path.join(dir, `${slug}.mp4`);
fs.copyFileSync(out, latest);

const all = fs
  .readdirSync(ensureVersions())
  .filter((f) => /^v\d+\.mp4$/.test(f))
  .sort((a, b) => Number(/\d+/.exec(a)![0]) - Number(/\d+/.exec(b)![0]));

console.log(`\n  ${path.relative(ROOT, out)}   (also copied to ${slug}.mp4)`);
console.log(`  versions: ${all.join(", ")}`);
console.log(`  Watch it. Would you post this to your own account? That is the whole gate.`);
