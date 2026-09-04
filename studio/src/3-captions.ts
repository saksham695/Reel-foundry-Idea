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

/**
 * whisper.cpp for real timings.
 *
 * NOT with `-ml 1`. That splits on model tokens, which for Devanagari cuts
 * multi-byte characters in half — the JSON comes back invalid UTF-8 and the
 * captions render as broken glyphs. Any non-Latin script hits this.
 *
 * Instead: take whisper's natural segments, which are always whole text, and
 * distribute each segment's span across its words by length. The anchors are
 * real speech boundaries, so it is far closer than a global even split, and no
 * grapheme is ever cut.
 */
function whisper(narration: string, base: string, language: string): Word[] {
  const cli = process.env.WHISPER_CLI!;
  const model = process.env.WHISPER_MODEL!;
  execFileSync(cli, ["-m", model, "-f", narration, "-l", language, "-oj", "-of", base], { stdio: "inherit" });

  const raw = readJson<{ transcription: { offsets: { from: number; to: number }; text: string }[] }>(`${base}.json`);
  const words: Word[] = [];
  for (const seg of raw.transcription) {
    const text = seg.text.trim();
    if (!text || /^\[.*\]$/.test(text)) continue;
    const from = seg.offsets.from / 1000;
    const span = Math.max(0.05, seg.offsets.to / 1000 - from);
    const tokens = text.split(/\s+/).filter(Boolean);
    const total = tokens.reduce((n, t) => n + t.length, 0) || 1;
    let cursor = from;
    for (const t of tokens) {
      const dur = (t.length / total) * span;
      words.push({ word: t, start: cursor, end: cursor + dur });
      cursor += dur;
    }
  }
  return words;
}

/**
 * Forced alignment, the cheap way.
 *
 * Whisper's TEXT cannot be trusted here — it is transcribing a synthetic voice and
 * comes back with "पताख्लों" for "पटाखों". But its TIMING is real. The script text
 * is already known exactly, so take the words from the script and the clock from
 * whisper: for each line, resample whisper's word starts onto the known words.
 *
 * Burning a mis-transcription into the captions would be worse than no whisper at
 * all, which is why this never uses whisper's own strings.
 */
function alignToScript(timing: Segment[], heard: Word[]): Word[] {
  const out: Word[] = [];
  for (const line of timing) {
    const known = line.text.split(/\s+/).filter(Boolean);
    if (!known.length) continue;
    const inLine = heard.filter((w) => w.start >= line.start - 0.08 && w.start < line.end + 0.08);
    const span = Math.max(0.05, line.end - line.start);

    for (let i = 0; i < known.length; i++) {
      let start: number;
      let end: number;
      if (inLine.length) {
        // Resample: known word i maps to the whisper word at the same relative position.
        const a = inLine[Math.min(inLine.length - 1, Math.floor((i * inLine.length) / known.length))];
        const b = inLine[Math.min(inLine.length - 1, Math.floor(((i + 1) * inLine.length) / known.length))];
        start = a.start;
        end = i === known.length - 1 ? line.end : Math.max(a.end, b.start);
      } else {
        // No whisper words landed in this line — fall back to proportional.
        const total = known.reduce((n, w) => n + w.length, 0) || 1;
        const before = known.slice(0, i).reduce((n, w) => n + w.length, 0);
        start = line.start + (before / total) * span;
        end = start + (known[i].length / total) * span;
      }
      out.push({ word: known[i], start, end: Math.max(end, start + 0.06) });
    }
  }
  return out;
}

const slug = slugArg();
const dir = renderDir(slug);
const timing = readJson<Segment[]>(path.join(dir, "timing.json"));
const narration = path.join(dir, "narration.wav");
const language = (process.env.SARVAM_LANGUAGE ?? "hi-IN").split("-")[0];

const haveWhisper = Boolean(process.env.WHISPER_CLI && process.env.WHISPER_MODEL && fs.existsSync(process.env.WHISPER_CLI!));
console.log(`[3/6] caption ${slug}  (${haveWhisper ? "whisper.cpp" : "even distribution — set WHISPER_CLI for real timings"})`);

const words = haveWhisper
  ? alignToScript(timing, whisper(narration, path.join(dir, "whisper"), language))
  : even(timing);
writeJson(path.join(dir, "words.json"), words);
console.log(`  ${words.length} words`);
