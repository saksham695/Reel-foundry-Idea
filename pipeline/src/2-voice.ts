/**
 * Stage 2 — narration.
 * script.json -> audio/<segment>.wav, narration.wav, timing.json
 *
 * One file per segment on purpose: per-segment boundaries are what let stage 3
 * fall back to even caption timing without whisper, and what stage 5 uses to cut visuals.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ScriptSchema, segments, type Script } from "./lib/schema.ts";
import { renderDir, slugArg, readJson, writeJson, ensure, requireEnv } from "./lib/paths.ts";
import { concat, durationSeconds } from "./lib/wav.ts";

const SAMPLE_RATE = 22050;

async function sarvam(text: string, out: string) {
  const res = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: { "api-subscription-key": requireEnv("SARVAM_API_KEY"), "content-type": "application/json" },
    body: JSON.stringify({
      text,
      language_code: process.env.SARVAM_LANGUAGE ?? "hi-IN",
      model: process.env.SARVAM_MODEL ?? "bulbul:v2",
      speaker: process.env.SARVAM_SPEAKER ?? "anushka",
      speech_sample_rate: SAMPLE_RATE,
      output_audio_codec: "wav",
      enable_preprocessing: true,
    }),
  });
  if (!res.ok) throw new Error(`Sarvam ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const body = (await res.json()) as { audios: string[] };
  if (!body.audios?.[0]) throw new Error("Sarvam returned no audio");
  fs.writeFileSync(out, Buffer.from(body.audios[0], "base64"));
}

/**
 * No key, no network. Two flavours:
 *   silent — a correctly-sized silent WAV. Instant. Proves timing, captions and
 *            render without judging voice quality, which you cannot judge from a
 *            robot voice anyway.
 *   say    — macOS `say`. Real audio, but under Rosetta it takes ~60s a line.
 */
function silent(text: string, out: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const seconds = Math.max(1.2, words / 2.6); // ~2.6 words/sec, natural Hindi pace
  const samples = Math.round(seconds * SAMPLE_RATE);
  const data = Buffer.alloc(samples * 2);
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(out, Buffer.concat([header, data]));
}

function say(text: string, out: string) {
  execFileSync("say", ["-o", out, "--data-format=LEI16@22050", "--file-format=WAVE", text]);
}

const slug = slugArg();
const dir = renderDir(slug);
const audioDir = ensure(path.join(dir, "audio"));
const script = ScriptSchema.parse(readJson<Script>(path.join(dir, "script.json")));
const engine = process.env.VOICE_ENGINE ?? "sarvam";

console.log(`[2/6] voice   ${slug}  (engine: ${engine})`);
const segs = segments(script);
const files: string[] = [];
for (const seg of segs) {
  const out = path.join(audioDir, `${seg.id}.wav`);
  if (engine === "silent") silent(seg.text, out);
  else if (engine === "say") say(seg.text, out);
  else await sarvam(seg.text, out);
  files.push(out);
  console.log(`  ${seg.id.padEnd(7)} ${durationSeconds(out).toFixed(2)}s  ${seg.text.slice(0, 50)}`);
}

const narration = path.join(dir, "narration.wav");
const starts = concat(files, narration);
const timing = segs.map((seg, i) => {
  const dur = durationSeconds(files[i]);
  return { id: seg.id, text: seg.text, on_screen: seg.on_screen, visual_cue: seg.visual_cue, start: starts[i], end: starts[i] + dur };
});

writeJson(path.join(dir, "timing.json"), timing);
console.log(`  total ${durationSeconds(narration).toFixed(2)}s → narration.wav`);
