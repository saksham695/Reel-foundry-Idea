/**
 * Stage 5 — assemble.
 * script + timing + words + shots -> props.json, the single object Remotion renders.
 */
import path from "node:path";
import { renderDir, staticPath, slugArg, readJson, writeJson } from "./lib/paths.ts";
import { ScriptSchema, type Props, type Script, type Shot, type Word } from "./lib/schema.ts";
import { durationSeconds, envelope } from "./lib/wav.ts";

const FPS = 30;
const TAIL = 0.5; // let the last word land before the cut

type Timing = { id: string; speaker: string; text: string; on_screen: string; expression: string; start: number; end: number };

const slug = slugArg();
const dir = renderDir(slug);
const script = ScriptSchema.parse(readJson<Script>(path.join(dir, "script.json")));
const timing = readJson<Timing[]>(path.join(dir, "timing.json"));
const words = readJson<Word[]>(path.join(dir, "words.json"));
const shots = readJson<Shot[]>(path.join(dir, "shots.json"));

const byLine = new Map(shots.map((s) => [s.line, s]));
const total = durationSeconds(path.join(dir, "narration.wav"));

const frames = Math.round((total + TAIL) * FPS);
const env = envelope(path.join(dir, "narration.wav"), FPS, frames);

const props: Props = {
  slug,
  language: script.language,
  fps: FPS,
  audio: staticPath(slug, "narration.wav"),
  durationInSeconds: total + TAIL,
  background: null,
  characters: script.characters,
  lines: timing.map((t, i) => ({
    id: t.id,
    speaker: t.speaker,
    text: t.text,
    on_screen: t.on_screen,
    expression: t.expression,
    start: t.start,
    // Hold each line's visual through its own pause, so a cut never lands in silence.
    end: i + 1 < timing.length ? timing[i + 1].start : total + TAIL,
    shot: byLine.get(t.id) ?? null,
  })),
  words,
  envelope: env,
};

console.log(`[5/6] props   ${slug}`);
writeJson(path.join(dir, "props.json"), props);
console.log(`  ${props.durationInSeconds.toFixed(2)}s → ${frames} frames, envelope peak ${Math.max(...env).toFixed(2)}`);
