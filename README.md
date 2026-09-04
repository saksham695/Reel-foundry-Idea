# Reel Foundry

> An engine that turns a one-line topic into a running content persona.

Give it a topic. It proposes the angle and thirty ideas, then publishes reels, posts and
stories to Instagram, YouTube and Facebook every day — behind a one-key human gate.
We run our own personas on it first, then open it to anyone with a topic.

**Status:** spec complete. A six-stage pipeline exists and renders 1080×1920 video.
Character generation does not exist yet — that is the next stage, and the thing that
unlocks Kahani.

## Start here

```bash
git clone https://github.com/saksham695/Reel-foundry-Idea.git
cd Reel-foundry-Idea/pipeline && npm install && cp .env.example .env
npm run make -- chai-mehngai
```

Full setup, keys and hardware notes: **[docs/RUN-ON-ANOTHER-MACHINE.md](docs/RUN-ON-ANOTHER-MACHINE.md)**
Copy-paste prompts for Claude Code: **[docs/PROMPTS.md](docs/PROMPTS.md)**

## What's in here

| Path | What it is |
|---|---|
| **[docs/prd-brd.md](docs/prd-brd.md)** | The full spec: problem, persona lineup, pipeline, agents, platform, costs, roadmap, risks, revenue model |
| [docs/prd-brd.html](docs/prd-brd.html) | The same document as originally published |
| **[docs/context.md](docs/context.md)** | How the lineup was chosen, what was rejected, the constraints behind v0.2 |
| **[docs/kahani-character-and-sample-reel.md](docs/kahani-character-and-sample-reel.md)** | Chameli, the first recurring character: locked identity, the image-first consistency pipeline, Episode 1 shot by shot |
| **[docs/RUN-ON-ANOTHER-MACHINE.md](docs/RUN-ON-ANOTHER-MACHINE.md)** | Setup, the keys and what each one blocks, hardware reality, macOS gotchas |
| **[docs/PROMPTS.md](docs/PROMPTS.md)** | Prompts to paste into Claude Code — from "make me a video" to "fine-tune the character" |
| `pipeline/` | The working six-stage pipeline: script → voice → captions → visuals → props → render |
| `characters/chameli.json` | The locked character definition — identity block, wardrobe, voice, sets, 12 sheet poses |
| `episodes/kahani-ep1.json` | Episode 1, all 9 shots with prompts, Hindi VO, timings and hero flags |
| `samples/` | A rendered output and its intermediate JSON — see the warning below |

## The pipeline

```
briefs/<slug>.md          written by hand
  │
  ├─ 1  script    Claude Opus 5, strict schema     → script.json
  ├─ 2  voice     Sarvam Bulbul (or macOS `say`)   → narration.wav + timing.json
  ├─ 3  captions  whisper.cpp (or even fallback)   → words.json
  ├─ 4  visuals   Pexels stock, portrait           → assets/ + manifest.json
  ├─ 5  props     merge                            → props.json
  └─ 6  render    Remotion, 1080×1920              → <slug>.mp4
```

The real deliverable is not the MP4 — it's `script.json` / `words.json` / `manifest.json`.
Those are the seams every agent in the PRD plugs into later. Get the shapes right by hand
now and the Planner, QA and Publisher become drop-ins.

**`samples/chai-mehngai.mp4` is a real video the pipeline produced** — 34.4s, 1080×1920,
Hindi script, 8/8 segments with footage, burned Hindi captions with word highlighting.
It was made with **no paid API key at all**, using `4-visuals-openverse.ts` (see below).
Its script and manifest are next to it so you can see the seams.

> ⚠️ `samples/smoke-no-visuals.mp4` renders black **on purpose**. It was produced with no
> `PEXELS_API_KEY`, so stage 4 returned nothing and `manifest.json` was empty — captions
> and audio over a black screen. Kept as the reference for what that failure looks like.

## The lineup

Bhakti (Hindi devotional), AI Tools (Hindi + English), Kahani (serialized Hindi story with
recurring characters), Comedy (conditional — original material only), Fitness & Yoga, and
Body Talk Men + Women (intimate-health education, strictest policy pack, credited doctor).
Scenery is b-roll only, never its own page.

**Start with three:** AI Tools, Kahani, Bhakti. The product layer comes only after
day-120 proof.

## Three things worth knowing before reading the rest

1. **Views and money are different axes.** The topics that get shared most in India reach a
   Hindi-speaking audience where YouTube Shorts pay ≈ $0.03 per 1,000 views. This plan
   chases those views on purpose but funds itself through sponsors, affiliate and long-form.
2. **A fully hands-off factory is what platforms now demonetize.** Original characters,
   original writing and a human gate are the moat — not polish.
3. **API access has a clock.** Meta Business Verification plus App Review, and a YouTube
   API compliance audit. Uploads from an unaudited project are locked private. File in
   week zero; ship a draft mode so nobody is blocked on it.

## The known ceiling

Stock footage plus narration is the cheapest thing that works, and it caps out at
"informational". It **cannot** produce Kahani — a recurring original character needs
generated, identity-locked stills, and no amount of stock footage gives you the same face
twice.

Swapping stage 4 for a character generator is the experiment, not a rewrite.
Prompt 3 in [docs/PROMPTS.md](docs/PROMPTS.md) builds it.

## Running with no keys at all

`pipeline/src/4-visuals-openverse.ts` is a drop-in replacement for `4-visuals.ts` that
sources CC-licensed stills from **Openverse instead of Pexels — no API key**. It writes
the same `manifest.json` shape, records a real licence and credit per asset, drops
anything not commercially usable, and broadens a query that returns nothing
(`"hands counting rupee notes"` → `"hands counting rupee"` → `"hands counting"`).

```bash
cp src/4-visuals-openverse.ts src/4-visuals.ts   # or call it directly
VOICE_ENGINE=silent npx tsx src/4-visuals-openverse.ts <slug>
```

That plus `VOICE_ENGINE=silent` produces a complete, watchable video with **zero spend**
— which is exactly how `samples/chai-mehngai.mp4` was made.

## Economics

≈ $25 variable cost per persona per month. ≈ $200/month to run five personas build-first,
against ≈ $1,040/month buying the equivalent tools. A character LoRA is ~$2–3 one-time;
stills ~$0.01 each; image-to-video ~$0.10–0.50 per clip.

**Stack.** TypeScript · Remotion · Postgres · BullMQ · Claude Opus 5 · Kokoro (English TTS)
/ Sarvam Bulbul (Hindi TTS) · whisper.cpp · Pexels/NASA stock · direct Instagram Graph API
+ YouTube Data API · Cloudflare R2.

---

Owner: Saksham Kumar. Solo build.
