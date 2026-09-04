# Running this on another machine

Everything needed to take this repo to a second laptop and produce a video.

## What the pipeline actually is

Six stages, one video, no queue and no database. You are the queue.

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

## Setup

```bash
git clone https://github.com/saksham695/Reel-foundry-Idea.git
cd Reel-foundry-Idea/pipeline
npm install
cp .env.example .env      # then fill it in
```

Node 18+. Remotion ships its own ffmpeg, so you do **not** need a system ffmpeg for the
render — but see the ffmpeg note at the bottom if you want to do anything by hand.

## Keys, in the order they block you

| Key | Where | Blocks | Cost |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com | stage 1 — no script, nothing runs | pennies per script |
| `PEXELS_API_KEY` | pexels.com/api | stage 4 — **without it the video renders black** | free, instant |
| `SARVAM_API_KEY` | sarvam.ai | stage 2 Hindi voice; skip with `VOICE_ENGINE=mock` | cheap |
| `WHISPER_CLI` / `WHISPER_MODEL` | whisper.cpp + large-v3 | optional — captions fall back to even spacing | free, local |

**The Pexels key is the one that matters most.** It is free and takes a minute. Without
it `manifest.json` comes back empty and Remotion renders correct captions and audio over
a black screen — see `samples/smoke-no-visuals.mp4`, which is exactly that failure.

## Make a video

```bash
npm run make -- chai-mehngai     # all six stages
npm run studio                    # or open the editor and scrub
```

One stage at a time, while iterating:

```bash
npm run brief -- <slug>
npm run voice -- <slug>
npm run captions -- <slug>
npm run visuals -- <slug>
npm run props -- <slug>
npm run render -- <slug>
```

Output lands in `public/renders/<slug>/`. It is gitignored — it lives under `public/`
only so Remotion's `staticFile()` can reach it.

Two briefs ship with the repo: `chai-mehngai` (Hindi observational comedy) and
`ai-tools-whatsapp`. Copy one to start a new persona.

## The gate

One acceptance criterion, and it is not a checklist:

> **Would you post this to your own account?**

If yes — post it manually, from your phone. Do not touch the Instagram Graph API or the
YouTube Data API for video #1. Meta App Review and the YouTube compliance audit take
weeks and are a separate track.

Then make videos #2–#7 the same way, by hand, seven days running. The manual week tells
you which stages actually need a gate. Automate after that, not before.

## The ceiling this pipeline has

Stock footage plus narration is the cheapest thing that works, and it caps out at
"informational". It **cannot** produce [Kahani](kahani-character-and-sample-reel.md) —
a recurring original character needs generated, identity-locked stills, and no amount of
Pexels footage gives you the same face twice.

Swapping stage 4 for a character generator is the experiment, not a rewrite. See
`characters/chameli.json` and `episodes/kahani-ep1.json` for what that stage has to
produce, and [PROMPTS.md](PROMPTS.md) for the prompt that builds it.

## Hardware — what actually failed on the first laptop

Measured on an **M2 / 8 GB RAM / ~9 GB free disk**:

| | Result |
|---|---|
| Local Flux image generation | **Impossible.** Weights are ~24 GB; 8 GB unified memory is under the ~16 GB floor |
| Local LoRA fine-tune | **Impossible.** Needs CUDA in practice; MPS training is not viable |
| torch / diffusers / PIL | Not installed, and no disk to install them into |
| Remotion render, 1080×1920 | **Fine.** This part works on modest hardware |

So on the second laptop, check free disk and RAM before planning local generation:

```bash
# macOS
echo "$(( $(sysctl -n hw.memsize) / 1073741824 )) GB RAM"; df -h /
```

- **≥ 32 GB RAM and ≥ 60 GB free** → local Flux via ComfyUI or diffusers is realistic.
- **Anything less** → use hosted generation. It is also just cheaper to start:
  a LoRA is ~$2–3 one-time on Replicate, stills ~$0.01 each, image-to-video ~$0.10–0.50
  per clip. Ninety per cent of a first episode costs under $5.

**Rendering is not the bottleneck. Generation is.**

## macOS notes worth keeping

- **Homebrew under Rosetta.** If the shell runs under Rosetta 2, `brew install` refuses
  to install into `/opt/homebrew` — and still **exits 0**. A backgrounded install reports
  success having installed nothing. Always `arch -arm64 /opt/homebrew/bin/brew install …`
  and verify by checking the binary path, never the exit code.
- **Homebrew's `ffmpeg` has no `drawtext` or `subtitles` filter** (no libfreetype, no
  libass), so burning text with plain ffmpeg fails. `ffmpeg-full` fixes it but pulls ~87
  extra formulae. Remotion renders text through headless Chrome and sidesteps this
  entirely — which is why the render stage is Remotion and not an ffmpeg filtergraph.
- **Free offline Hindi voice for timing:** `say -v Lekha -r 168 -o out.aiff "…"`. Good
  enough to check pacing, not good enough to publish.
