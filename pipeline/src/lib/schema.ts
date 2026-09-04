import { z } from "zod";

/**
 * The contract every stage downstream of the writer consumes.
 * Keep this stable — the Planner, QA and Publisher agents in the PRD all
 * plug into these shapes later. Changing a field name is a pipeline break.
 */
export const BeatSchema = z.object({
  text: z.string().describe("One or two spoken sentences. This is narrated verbatim."),
  visual_cue: z
    .string()
    .describe("English stock-footage search phrase for this beat, 2-5 words, concrete and filmable."),
  on_screen: z.string().describe("Short punchy overlay text, max 5 words, same language as `text`."),
});

export const ScriptSchema = z.object({
  slug: z.string().describe("kebab-case id for this video"),
  language: z.enum(["hi", "en", "hinglish"]),
  hook: z.string().describe("The first 2 seconds. Spoken first, before beat 1."),
  hook_visual_cue: z.string().describe("English stock-footage search phrase for the hook."),
  beats: z.array(BeatSchema).min(4).max(7),
  cta: z.string().describe("One short spoken line at the end."),
  title: z.string().describe("YouTube/Instagram title, under 90 chars"),
  caption: z.string().describe("Instagram caption, 2-3 lines"),
  hashtags: z.array(z.string()).min(5).max(15),
});

export type Script = z.infer<typeof ScriptSchema>;
export type Beat = z.infer<typeof BeatSchema>;

/** Every spoken segment in order: the hook, each beat, then the CTA. */
export function segments(script: Script): { id: string; text: string; visual_cue: string; on_screen: string }[] {
  return [
    { id: "hook", text: script.hook, visual_cue: script.hook_visual_cue, on_screen: script.hook },
    ...script.beats.map((b, i) => ({ id: `beat-${i + 1}`, text: b.text, visual_cue: b.visual_cue, on_screen: b.on_screen })),
    { id: "cta", text: script.cta, visual_cue: script.beats[script.beats.length - 1].visual_cue, on_screen: script.cta },
  ];
}

export type Word = { word: string; start: number; end: number };

export type AssetRef = {
  segment: string;
  kind: "video" | "photo";
  file: string;
  source: string;
  license: string;
  credit: string;
};

export type Props = {
  slug: string;
  language: string;
  fps: number;
  audio: string;
  durationInSeconds: number;
  segments: { id: string; text: string; on_screen: string; start: number; end: number; asset: AssetRef | null }[];
  words: Word[];
};
