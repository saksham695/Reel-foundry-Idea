/**
 * Stage 3 — word-level captions.
 * narration.wav + timing.json -> words.json
 *
 * With whisper.cpp you get real word timings. Without it, words are spread
 * evenly inside each segment — imperfect, but good enough to judge a first cut,
 * so day 1 is never blocked on a 3GB model download.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { renderDir, slugArg, readJson, writeJson } from "./lib/paths.ts";
import type { Word } from "./lib/schema.ts";

type Segment = { id: string; text: string; start: number; end: number };

function even(timing: Segment[]): Word[] {
  const words: Word[] = [];
  for (const seg of timing) {
    const tokens = seg.text.split(/\s+/).filter(Boolean);
    // Weight by character count — "क्योंकि" takes longer to say than "है".
    const total = tokens.reduce((n, t) => n + t.length, 0) || 1;
    let cursor = seg.start;
    const span = seg.end - seg.start;
    for (const t of tokens) {
      const dur = (t.length / total) * span;
      words.push({ word: t, start: cursor, end: cursor + dur });
      cursor += dur;
    }
  }
  return words;
}

function whisper(narration: string, base: string, language: string): Word[] {
  const cli = process.env.WHISPER_CLI!;
  const model = process.env.WHISPER_MODEL!;
  execFileSync(cli, ["-m", model, "-f", narration, "-l", language, "-ml", "1", "-oj", "-of", base], { stdio: "inherit" });
  const raw = readJson<{ transcription: { offsets: { from: number; to: number }; text: string }[] }>(`${base}.json`);
  return raw.transcription
    .map((t) => ({ word: t.text.trim(), start: t.offsets.from / 1000, end: t.offsets.to / 1000 }))
    .filter((w) => w.word.length > 0 && !/^\[.*\]$/.test(w.word));
}

const slug = slugArg();
const dir = renderDir(slug);
const timing = readJson<Segment[]>(path.join(dir, "timing.json"));
const narration = path.join(dir, "narration.wav");
const language = (process.env.SARVAM_LANGUAGE ?? "hi-IN").split("-")[0];

const haveWhisper = Boolean(process.env.WHISPER_CLI && process.env.WHISPER_MODEL && fs.existsSync(process.env.WHISPER_CLI!));
console.log(`[3/6] caption ${slug}  (${haveWhisper ? "whisper.cpp" : "even distribution — set WHISPER_CLI for real timings"})`);

const words = haveWhisper ? whisper(narration, path.join(dir, "whisper"), language) : even(timing);
writeJson(path.join(dir, "words.json"), words);
console.log(`  ${words.length} words`);
