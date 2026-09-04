/**
 * Voice direction — the layer between a written line and a TTS engine.
 *
 * The single biggest reason AI narration sounds like AI is not the model. It is
 * that the script was written to be *read* and then handed to something that has
 * to *speak* it. Long compound clauses, no breath points, uniform sentence
 * length: every line lands with the same rhythm, and that sameness is what the
 * ear hears as synthetic.
 *
 * So direction happens in two places, in this order of impact:
 *
 *   1. The writing.  Breath lines — one idea per line, short clauses, punctuation
 *      placed where a person would actually inhale. Enforced in the stage-1
 *      system prompt and checked here.
 *   2. The markup.   Explicit pauses, emphasis and emotion, emitted in whatever
 *      dialect the target engine speaks: SSML for Sarvam/Google/Azure/Speechify,
 *      bracketed audio tags for ElevenLabs v3.
 *
 * Rules that are deliberately conservative, because over-direction is its own
 * tell: emphasise only payoff words, keep prosody changes moderate, and never
 * put a tag on every line. If everything is emphasised, nothing is.
 */

export type Emotion =
  | "neutral" | "warm" | "wry" | "concerned" | "urgent" | "amused" | "resigned";

export type Direction = {
  /** How this line is delivered. */
  emotion?: Emotion;
  /** Words to lean on. Keep to one or two per line — these are payoff words. */
  emphasis?: string[];
  /** Milliseconds of silence *before* the line. The reveal pause. */
  pauseBefore?: number;
  /** Slower than 1 for a landing line, faster for a throwaway. 0.9–1.1 is plenty. */
  rate?: number;
};

/** Per-emotion prosody. Small numbers on purpose — big swings sound theatrical. */
const PROSODY: Record<Emotion, { rate: number; pitch: string }> = {
  neutral:   { rate: 1.00, pitch:  "+0%"  },
  warm:      { rate: 0.96, pitch:  "-2%"  },
  wry:       { rate: 0.94, pitch:  "-4%"  },
  concerned: { rate: 0.93, pitch:  "-3%"  },
  urgent:    { rate: 1.08, pitch:  "+3%"  },
  amused:    { rate: 1.02, pitch:  "+2%"  },
  resigned:  { rate: 0.90, pitch:  "-5%"  },
};

/** ElevenLabs v3 reads bracketed tags as delivery instructions. */
const AUDIO_TAG: Record<Emotion, string> = {
  neutral: "", warm: "[warmly]", wry: "[wry]", concerned: "[concerned]",
  urgent: "[urgent]", amused: "[amused]", resigned: "[resigned tone]",
};

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/** Wrap the payoff words in <emphasis>. Matches whole words only, first hit each. */
function markEmphasis(text: string, words: string[] | undefined) {
  if (!words?.length) return escapeXml(text);
  let out = escapeXml(text);
  for (const w of words.slice(0, 2)) {
    const e = escapeXml(w);
    const re = new RegExp(`(^|\\s)(${e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?=\\s|[।.,!?]|$)`);
    out = out.replace(re, `$1<emphasis level="moderate">$2</emphasis>`);
  }
  return out;
}

/**
 * SSML for engines that accept it. A comma is a micro pause the engine already
 * honours; `pauseBefore` is the deliberate reveal pause, and it is the thing
 * that buys a line its weight.
 */
export function toSSML(text: string, d: Direction = {}): string {
  const p = PROSODY[d.emotion ?? "neutral"];
  const rate = ((d.rate ?? 1) * p.rate).toFixed(2);
  const body = markEmphasis(text, d.emphasis);
  const lead = d.pauseBefore ? `<break time="${Math.min(d.pauseBefore, 2000)}ms"/>` : "";
  return `<speak>${lead}<prosody rate="${rate}" pitch="${p.pitch}">${body}</prosody></speak>`;
}

/** ElevenLabs v3 dialect: bracketed tags, and ellipses for hesitation. */
export function toAudioTags(text: string, d: Direction = {}): string {
  const tag = AUDIO_TAG[d.emotion ?? "neutral"];
  const lead = d.pauseBefore && d.pauseBefore >= 400 ? "[pause] " : "";
  let body = text;
  for (const w of (d.emphasis ?? []).slice(0, 2)) {
    body = body.replace(new RegExp(`(^|\\s)(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?=\\s|[।.,!?]|$)`), `$1${w.toUpperCase()}`);
  }
  return `${lead}${tag ? tag + " " : ""}${body}`.trim();
}

/**
 * A written line that no engine will make sound human. Reported, not fixed —
 * the fix belongs in the writing, and silently rewriting a script is worse than
 * telling the writer their line does not breathe.
 */
export function breathCheck(text: string): string[] {
  const problems: string[] = [];
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length > 22) problems.push(`${words.length} words in one line — no breath point; split it`);
  const clauses = text.split(/[,;।.!?]/).filter((c) => c.trim().split(/\s+/).length > 14);
  if (clauses.length) problems.push(`a clause runs ${clauses[0].trim().split(/\s+/).length} words without punctuation`);
  if (/\b(जो कि|के द्वारा|किया जाता है|which is being|in order to)\b/i.test(text))
    problems.push("written register, not spoken — rephrase the way a person would say it");
  return problems;
}
