/**
 * Stage 5 — assemble.
 * script + timing + words + manifest -> props.json, the single object Remotion renders.
 */
import path from "node:path";
import { renderDir, staticPath, slugArg, readJson, writeJson } from "./lib/paths.ts";
import type { AssetRef, Props, Word } from "./lib/schema.ts";
import { durationSeconds } from "./lib/wav.ts";

const FPS = 30;
const TAIL = 0.4; // let the last word breathe before the cut

type Segment = { id: string; text: string; on_screen: string; start: number; end: number };

const slug = slugArg();
const dir = renderDir(slug);
const script = readJson<{ language: string }>(path.join(dir, "script.json"));
const timing = readJson<Segment[]>(path.join(dir, "timing.json"));
const words = readJson<Word[]>(path.join(dir, "words.json"));
const manifest = readJson<AssetRef[]>(path.join(dir, "manifest.json"));

const byId = new Map(manifest.map((a) => [a.segment, a]));

const props: Props = {
  slug,
  language: script.language,
  fps: FPS,
  audio: staticPath(slug, "narration.wav"),
  durationInSeconds: durationSeconds(path.join(dir, "narration.wav")) + TAIL,
  segments: timing.map((s) => {
    const asset = byId.get(s.id);
    return {
      id: s.id,
      text: s.text,
      on_screen: s.on_screen,
      start: s.start,
      end: s.end,
      asset: asset ? { ...asset, file: staticPath(slug, "assets", asset.file) } : null,
    };
  }),
  words,
};

console.log(`[5/6] props   ${slug}`);
writeJson(path.join(dir, "props.json"), props);
console.log(`  ${props.durationInSeconds.toFixed(2)}s → ${Math.round(props.durationInSeconds * FPS)} frames`);
