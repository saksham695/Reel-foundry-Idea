import { z } from "zod";

/**
 * The contract every stage downstream of the writer consumes.
 * Shape follows what actually travels on Indian Shorts: two characters talking,
 * not narration over stock. Keep it stable — the Planner, QA and Publisher agents
 * in the PRD all plug into these shapes later.
 */

export const CharacterSchema = z.object({
  id: z.string().describe("kebab-case id, referenced by every line"),
  name: z.string(),
  look: z.string().describe("One sentence describing the character, fed to the image generator."),
  /** Voice knobs. `sarvam` names a Bulbul speaker; `rate`/`pitch` drive the macOS fallback. */
  sarvam_speaker: z.string().default("anushka"),
  rate: z.number().default(170).describe("words per minute for the local fallback voice"),
  pitch: z.number().default(50).describe("0-100 baseline pitch for the local fallback voice"),
  side: z.enum(["left", "right"]).describe("which side of frame this character stands on"),
});

export const LineSchema = z.object({
  speaker: z.string().describe("character id"),
  text: z.string().describe("Spoken verbatim. One idea. No emoji, no markdown."),
  expression: z.enum(["neutral", "happy", "shock", "annoyed", "sly"]).default("neutral"),
  on_screen: z.string().default("").describe("Optional overlay, max 4 words. Usually empty."),
  /**
   * Comic timing. The silence after this line, in milliseconds.
   * 150-250 inside an exchange, 500-800 before a punchline, 300 after it.
   */
  pause_after_ms: z.number().min(0).max(2000).default(200),
  shot: z.string().describe("English image prompt for this line's visual, 6-12 words, concrete."),
});

export const ScriptSchema = z.object({
  slug: z.string(),
  language: z.enum(["hi", "en", "hinglish"]),
  setting: z.string().describe("One sentence describing the location, fed to the background generator."),
  characters: z.array(CharacterSchema).min(1).max(3),
  lines: z.array(LineSchema).min(5).max(14),
  title: z.string().describe("YouTube/Instagram title under 90 chars, in the video's language"),
  caption: z.string(),
  hashtags: z.array(z.string()).min(5).max(15),
});

export type Character = z.infer<typeof CharacterSchema>;
export type Line = z.infer<typeof LineSchema>;
export type Script = z.infer<typeof ScriptSchema>;

export function lineId(i: number) {
  return `line-${String(i + 1).padStart(2, "0")}`;
}

export type Word = { word: string; start: number; end: number };

/** A shot is N stills played back at `fps` — the cheap substitute for generated video. */
export type Shot = {
  line: string;
  frames: string[];
  fps: number;
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
  background: string | null;
  characters: Character[];
  lines: {
    id: string;
    speaker: string;
    text: string;
    on_screen: string;
    expression: string;
    start: number;
    end: number;
    shot: Shot | null;
  }[];
  words: Word[];
  /** Loudness per video frame, 0..1 — drives which mouth still is shown. */
  envelope: number[];
};
