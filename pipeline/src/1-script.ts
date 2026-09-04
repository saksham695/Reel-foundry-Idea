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

const SYSTEM = `You write scripts for vertical short-form video (Reels / YouTube Shorts) for an Indian audience.

Hard rules:
- The hook is the first two seconds. It is a line of dialogue or a claim, never "aaj hum baat karenge" and never a title card.
- Write for the ear, in BREATH LINES. One idea per line. Short clauses. Punctuation goes where a person actually inhales — read every line aloud in your head and if you run out of breath, split it. Long compound clauses are the single biggest reason narration sounds synthetic, and no voice model can rescue one.
- Vary the rhythm. If every line is the same length the delivery lands the same way every time, and sameness is what the ear hears as a robot. Mix a four-word line against a fourteen-word one.
- No lists, no markdown, no emoji in spoken text.
- Every beat is one idea. If a beat needs a comma-spliced second idea, split it.
- visual_cue is an ENGLISH stock-footage search phrase — concrete nouns a camera can point at ("man laughing on sofa", "kitchen sugar jar"), never abstractions ("inflation", "happiness").
- on_screen text is at most 5 words, in the same language as the narration.
- The CTA is one line and never says "like share subscribe" in those words.
- Total narration must land between 30 and 45 seconds when spoken at a natural pace (roughly 90-130 words for Hindi).

Every spoken line carries a \`direction\` object that tells the voice how to say it:
- \`emotion\` — vary it across the script. Eight neutral lines is exactly what sounds like a machine. A counting beat is neutral; the line that reveals the number is wry or concerned; the closing turn is warm or resigned.
- \`emphasis\` — at most two payoff words, copied verbatim from the line. Usually the number, the turn, or the contradiction. Often the right answer is none: if everything is emphasised, nothing is.
- \`pause_before_ms\` — 0 when the thought continues. 400-800 before a reveal, a turn, or a punchline. This pause is what buys a line its weight; it is the difference between stating a fact and landing one.

Register: if the brief says Hindi, write natural spoken Hindi in Devanagari, the way people actually talk — Hinglish loanwords where a real person would use them. Do not write formal/literary Hindi.`;

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
const words = [script.hook, ...script.beats.map((b) => b.text), script.cta].join(" ").split(/\s+/).length;
console.log(`  ${script.beats.length} beats, ~${words} words, ~${Math.round(words / 2.4)}s spoken`);
console.log(`  hook: ${script.hook}`);
