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
  ├─ 2  voice     Sarvam Bulbul, one file per line  → narration.wav + timing.json
  ├─ 3  captions  whisper.cpp (or even fallback)    → words.json
  ├─ 4  images    vector | flux | pexels            → images/<line>/f000… + shots.json
  ├─ 5  props     merge                             → props.json
  └─ 6  render    Remotion, 1080×1920               → <slug>.mp4
```

## Two decisions this repo makes

**A sketch is two characters talking, not narration over stock.** That is what actually
travels on Indian Shorts — the channels doing 13M views a month are all character
dialogue, and the ones doing 200K are the same format done badly. So the script schema is
`characters[]` + `lines[]`, each line carrying its speaker, expression, and its own
`pause_after_ms`. Comic timing is data the writer sets, not a constant in the concat step.

**Video is stills played at a frame rate, not generated video.** A talking character is
eight frames cycled at 8fps. Generated video is the same picture for 20-70x the price:

| Route | 40s reel | 105 reels/mo |
|---|---|---|
| `vector` local SVG | $0.00 | **$0** |
| `flux` 8 frames × 10 lines @ $0.003 | $0.24 | **$25** |
| Veo 3.1 Lite 1080p @ $0.05/s | $2.00 | $210 |
| Kling 3.0 @ $0.09-0.14/s | $3.60-5.60 | $378-588 |

`IMAGE_FPS` and `FRAMES_PER_LINE` are the dial. 8 frames at 8fps reads as speech; one
frame at 1fps is a slideshow with Ken Burns. Swapping providers changes nothing
downstream — `shots.json` is the same shape either way.

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
| `PEXELS_API_KEY` | pexels.com/api — only for `IMAGE_PROVIDER=pexels` | nothing by default |
| `SARVAM_API_KEY` | sarvam.ai — Hindi narration | stage 2 (skip with `VOICE_ENGINE=local`) |
| `REPLICATE_API_TOKEN` | replicate.com — only for `IMAGE_PROVIDER=flux` | nothing by default |
| `WHISPER_CLI` / `WHISPER_MODEL` | whisper.cpp + large-v3 | optional, stage 3 |

Nothing else is required — Remotion ships its own ffmpeg.

## Make a video

```bash
npm run make -- chai-bina-cheeni    # all six stages
npm run studio                       # or open the editor and scrub
```

Individual stages, when you're iterating on one:

```bash
npm run brief    -- chai-mehngai
npm run voice    -- chai-mehngai
npm run captions -- chai-mehngai
npm run images   -- chai-mehngai
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
