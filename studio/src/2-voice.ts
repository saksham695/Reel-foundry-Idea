/**
 * Stage 2 — narration.
 * script.json -> audio/<line>.wav, narration.wav, timing.json
 *
 * One file per line, on purpose. Per-line boundaries are what carry comic timing
 * (each line's own `pause_after_ms`), what let stage 3 fall back to even caption
 * timing without whisper, and what stage 5 uses to cut the image sequence.
 */
import fs from "node:fs";
import path from "node:path";
import { execFile, execFileSync } from "node:child_process";
import os from "node:os";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
import { ScriptSchema, lineId, type Character, type Script } from "./lib/schema.ts";
import { renderDir, slugArg, readJson, writeJson, ensure, requireEnv } from "./lib/paths.ts";
import { concat, durationSeconds } from "./lib/wav.ts";

const SAMPLE_RATE = 22050;

async function sarvam(text: string, who: Character, out: string) {
  const res = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: { "api-subscription-key": requireEnv("SARVAM_API_KEY"), "content-type": "application/json" },
    body: JSON.stringify({
      text,
      language_code: process.env.SARVAM_LANGUAGE ?? "hi-IN",
      model: process.env.SARVAM_MODEL ?? "bulbul:v2",
      speaker: who.sarvam_speaker,
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
 * macOS `say`. Lekha is the only Hindi voice on the system, so characters are
 * separated by rate and pitch rather than by voice. It is a real human-recorded
 * voice, not a neural one — it will read Hindi correctly and still sound synthetic.
 * Slow here (~10x realtime under Rosetta), so expect a minute or two per reel.
 */
function sayArgs(text: string, who: Character, out: string) {
  return [
    "-v", process.env.SAY_VOICE ?? "Lekha",
    "-r", String(Math.round(who.rate)),
    "-o", out,
    "--data-format=LEI16@22050",
    "--file-format=WAVE",
    `[[pbas ${Math.round(who.pitch)}]] ${text}`,
  ];
}

function local(text: string, who: Character, out: string) {
  execFileSync("say", sayArgs(text, who, out));
}

/**
 * `say` runs at roughly 10x realtime here and pins a single core, so a ten-line
 * reel is minutes of dead wall-clock. Each line is independent, so they are
 * generated concurrently across the cores instead — the whole reel then costs
 * about as long as its slowest single line.
 */
async function localAll(jobs: { text: string; who: Character; out: string }[]) {
  const limit = Math.max(2, Math.min(jobs.length, os.cpus().length - 1));
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < jobs.length) {
        const j = jobs[next++];
        await execFileAsync("say", sayArgs(j.text, j.who, j.out));
      }
    }),
  );
}

/** Correctly-sized silence. Instant, for checking layout and timing without spending anything. */
function silent(text: string, out: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const seconds = Math.max(1.0, words / 2.6);
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

const slug = slugArg();
const dir = renderDir(slug);
const audioDir = ensure(path.join(dir, "audio"));
const script = ScriptSchema.parse(readJson<Script>(path.join(dir, "script.json")));
const engine = process.env.VOICE_ENGINE ?? "sarvam";
const cast = new Map(script.characters.map((c) => [c.id, c]));

console.log(`[2/6] voice   ${slug}  (engine: ${engine})`);
const files: string[] = [];
const gaps: number[] = [];
const jobs: { text: string; who: Character; out: string }[] = [];
for (const [i, line] of script.lines.entries()) {
  const who = cast.get(line.speaker);
  if (!who) throw new Error(`line ${i + 1} speaks as "${line.speaker}", who is not in characters[]`);
  const out = path.join(audioDir, `${lineId(i)}.wav`);
  files.push(out);
  gaps.push(line.pause_after_ms);
  jobs.push({ text: line.text, who, out });
}

if (engine === "local") {
  console.log(`  ${jobs.length} lines in parallel…`);
  await localAll(jobs);
} else {
  for (const [i, j] of jobs.entries()) {
    if (engine === "silent") silent(j.text, j.out);
    else await sarvam(j.text, j.who, j.out);
    void i;
  }
}

script.lines.forEach((line, i) => {
  const who = cast.get(line.speaker)!;
  console.log(`  ${lineId(i)} ${who.name.padEnd(10)} ${durationSeconds(files[i]).toFixed(2)}s +${line.pause_after_ms}ms  ${line.text.slice(0, 44)}`);
});

const narration = path.join(dir, "narration.wav");
const starts = concat(files, narration, gaps);
const timing = script.lines.map((line, i) => ({
  id: lineId(i),
  speaker: line.speaker,
  text: line.text,
  on_screen: line.on_screen,
  expression: line.expression,
  shot: line.shot,
  start: starts[i],
  end: starts[i] + durationSeconds(files[i]),
}));

writeJson(path.join(dir, "timing.json"), timing);
console.log(`  total ${durationSeconds(narration).toFixed(2)}s → narration.wav`);
