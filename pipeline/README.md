# reel-foundry — video #1

The vertical slice of the Reel Foundry pipeline. One video, end to end, on your machine.

This is **not** the factory. No queue, no Postgres, no Planner agent, no QA agent, no
publishing API, no review UI. You are the queue. The point is to find out which stage is
the weak link before building nine stages around it.

## The six stages

```
briefs/<slug>.md          you write this, by hand
  │
  ├─ 1  script    Claude Opus 5, strict schema      → script.json
  ├─ 2  voice     Sarvam Bulbul (or macOS `say`)    → narration.wav + timing.json
  ├─ 3  captions  whisper.cpp (or even fallback)    → words.json
  ├─ 4  visuals   Pexels, portrait                  → assets/ + manifest.json
  ├─ 5  props     merge                             → props.json
  └─ 6  render    Remotion, 1080×1920               → <slug>.mp4
```

The real deliverable of day 1 is not the MP4 — it's `script.json` / `words.json` /
`manifest.json`. Those are the seams every agent in the PRD plugs into later.
Get the shapes right by hand now and the Planner, QA and Publisher become drop-ins.

## Setup

```bash
npm install
cp .env.example .env      # then fill it in
```

Keys you need, in the order they block you:

| Key | Where | Blocks |
|---|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com | stage 1 |
| `PEXELS_API_KEY` | pexels.com/api — free, instant | stage 4 |
| `SARVAM_API_KEY` | sarvam.ai — Hindi narration | stage 2 (skip with `VOICE_ENGINE=mock`) |
| `WHISPER_CLI` / `WHISPER_MODEL` | whisper.cpp + large-v3 | optional, stage 3 |

Nothing else is required — Remotion ships its own ffmpeg.

## Make a video

```bash
npm run make -- chai-mehngai        # all six stages
npm run studio                       # or open the editor and scrub
```

Individual stages, when you're iterating on one:

```bash
npm run brief    -- chai-mehngai
npm run voice    -- chai-mehngai
npm run captions -- chai-mehngai
npm run visuals  -- chai-mehngai
npm run props    -- chai-mehngai
npm run render   -- chai-mehngai
```

Everything lands in `public/renders/<slug>/`. It's under `public/` so Remotion's
`staticFile()` can reach it; it's gitignored.

## The gate

There is one acceptance criterion and it is not a checklist:

> **Would you post this to your own account?**

If yes, do — manually, from your phone. Do not touch the Instagram Graph API or the
YouTube Data API for video #1; Meta App Review and the YouTube compliance audit take
weeks and are a separate track.

Then make videos #2–#7 the same way, by hand, seven days running. The manual week is
what tells you which stages actually need a gate. Automate after that, not before.

## Known ceiling

Stock footage plus narration is the cheapest thing that works, and it caps out at
"informational". The Hindi comedy format that actually travels on Indian Shorts is
**generated characters holding a conversation** — which is a different visual stage
(Veo / Kling per second) and a different cost model. This repo is the spine; swapping
stage 4 for a character generator is the experiment, not a rewrite.
