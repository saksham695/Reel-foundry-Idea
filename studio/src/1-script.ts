/**
 * Stage 1 — the writer.
 * brief (markdown, written by a human) -> script.json (the contract).
 *
 * There is deliberately no Planner agent yet. You pick the topic; this stage
 * only turns a brief into the strict shape the rest of the pipeline eats.
 */
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { ScriptSchema } from "./lib/schema.ts";
import { ROOT, renderDir, slugArg, writeJson, requireEnv } from "./lib/paths.ts";

const SYSTEM = `You write two-character comedy sketches for vertical short video (Reels / YouTube Shorts) for an Indian audience.

Format, non-negotiable:
- A sketch is dialogue between two people in one location. Never narration over footage.
- The first line lands the premise in under two seconds. No setup, no title, no "aaj hum".
- One idea per line. If a line needs a comma to hold two thoughts, split it.
- 8 to 12 lines, 30 to 45 seconds spoken. Hindi runs about 2.4 words a second.
- Build to a turn, not to a summary. The last line should reframe what came before, not explain it.

Comic timing is data. Set pause_after_ms deliberately:
- 150-250 inside a quick exchange
- 500-800 on the line right before a punchline
- 300-400 after a punchline lands
Get this wrong and the joke dies even if the writing is good.

Other rules:
- shot is an ENGLISH image prompt, 6-12 words, concrete and drawable — a camera or an
  illustrator has to be able to make it. Never an abstraction.
- on_screen is usually empty. Use it only when a written word is itself the joke.
- No emoji, no markdown, no stage directions in spoken text.
- No politics, no punching down at a caste, religion, region or gender.

Register: natural spoken Hindi in Devanagari, the way people actually talk, Hinglish
loanwords where a real person would use them. Not literary Hindi.`;


const slug = slugArg();
requireEnv("ANTHROPIC_API_KEY");

const briefFile = path.join(ROOT, "briefs", `${slug}.md`);
if (!fs.existsSync(briefFile)) throw new Error(`No brief at briefs/${slug}.md — write one first.`);
const brief = fs.readFileSync(briefFile, "utf8");

const client = new Anthropic();

console.log(`[1/6] script  ${slug}`);
const response = await client.messages.parse({
  model: "claude-opus-5",
  max_tokens: 16000,
  system: SYSTEM,
  thinking: { type: "adaptive" },
  messages: [{ role: "user", content: `Write the video from this brief. The slug is "${slug}".\n\n---\n${brief}` }],
  output_config: { format: zodOutputFormat(ScriptSchema) },
});

const script = response.parsed_output;
if (!script) throw new Error(`Model did not return a valid script. stop_reason=${response.stop_reason}`);

writeJson(path.join(renderDir(slug), "script.json"), script);
const words = script.lines.map((l) => l.text).join(" ").split(/\s+/).length;
const pauses = script.lines.reduce((n, l) => n + l.pause_after_ms, 0) / 1000;
console.log(`  ${script.lines.length} lines, ~${words} words, ~${(words / 2.4 + pauses).toFixed(1)}s with pauses`);
console.log(`  opens: ${script.lines[0].text}`);
