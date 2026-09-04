# Prompts

Copy-paste prompts for Claude Code. Run them from the repo root on the second laptop.

Each one is written to be pasted whole. They assume nothing about what Claude remembers —
every prompt names the files it needs.

---

## 0 · Bootstrap the machine

> Read `docs/RUN-ON-ANOTHER-MACHINE.md`. Set this repo up on this machine: install the
> pipeline dependencies, create `pipeline/.env` from `.env.example`, and tell me exactly
> which keys are missing and what each one blocks. Then report this laptop's RAM and free
> disk, and tell me whether local image generation is realistic here or whether I should
> use hosted generation. Do not put any real key into a file that git tracks.

---

## 1 · Make a video from the existing pipeline (start here)

This is the shortest path to a real video. It needs `ANTHROPIC_API_KEY` and
`PEXELS_API_KEY` only.

> In `pipeline/`, run the full six-stage pipeline for the brief `chai-mehngai`:
> `npm run make -- chai-mehngai`. If any stage fails, diagnose and fix it rather than
> skipping it. When it finishes, extract three frames from the output MP4 and show them
> to me so I can see whether there is actually footage behind the captions — a black
> screen means stage 4 got nothing back and `manifest.json` is empty. Report the duration,
> resolution, and whether the narration and captions line up.

---

## 2 · Turn a one-line idea into a finished video

**This is the prompt to use day to day.** Replace the idea in the first line.

> I want a reel about: **<your one-line idea here>**
>
> Read `pipeline/briefs/chai-mehngai.md` to see the brief format, then:
> 1. Write a new brief at `pipeline/briefs/<slug>.md` for my idea. Decide the persona,
>    the language (Hindi in Devanagari unless the idea is clearly English), the angle,
>    and the do-nots. Visual cues must be concrete things a stock camera has actually
>    filmed — never abstractions.
> 2. Run `npm run make -- <slug>`.
> 3. Show me frames from the result and tell me honestly whether you would post it.
>
> Keep the narration between 30 and 45 seconds. The hook is the first two seconds and it
> is a line of dialogue or a claim — never a title card, never "aaj hum baat karenge".

---

## 3 · Add the generation stage (this is what unlocks Kahani)

Stage 4 currently pulls Pexels stock. Stock cannot give you the same face twice, so
[Kahani](kahani-character-and-sample-reel.md) is impossible until this exists.

> Read `docs/kahani-character-and-sample-reel.md`, `characters/chameli.json` and
> `episodes/kahani-ep1.json`.
>
> Build a new stage `pipeline/src/4b-generate.ts` that is a drop-in alternative to
> `4-visuals.ts`: instead of fetching stock from Pexels, it generates one still per shot
> with Flux on Replicate and writes the same `manifest.json` shape that `5-props.ts`
> already consumes. Requirements:
> - Every prompt is built as: the character's `identity_block`, then the shot's `prompt`,
>   then the character's `style_tail` — in that order, with the character's fixed `seed`.
>   Never vary the identity block or the tail.
> - Support an optional `lora_weights` field on the character so a trained LoRA is used
>   when one exists.
> - Cache by prompt hash so re-running does not pay twice.
> - Fail loudly if `REPLICATE_API_TOKEN` is missing. Never write it to a tracked file.
>
> Then show me the cost per episode before I run it.

---

## 4 · Build Chameli's character sheet

Do this **before** any fine-tune. A LoRA needs ~20 images of a character who does not
exist yet — you bootstrap the identity from seed-locked generation first.

> Read `characters/chameli.json`. Generate her 12-pose character sheet using the
> `sheet_poses` list, with the locked `identity_block`, `style_tail`, `negative` and
> `seed` applied identically to every pose. Save them to `pipeline/public/characters/chameli/sheet/`.
>
> Then show me all 12 side by side and tell me which ones disagree with each other on the
> four things that must never change: the mole below the right eye, the silver nose stud
> on the left, the stray strand at the left temple, and the maroon shawl. Discard the ones
> that fail. I need at least 8 that agree.

---

## 5 · Fine-tune the LoRA

Only after step 4 has produced 8+ consistent stills.

> Take the approved stills in `pipeline/public/characters/chameli/sheet/`, zip them, and
> train a Flux LoRA on Replicate using `ostris/flux-dev-lora-trainer` with trigger word
> `CHAMELI` from `characters/chameli.json`. Tell me the cost before starting.
>
> When training finishes, write the resulting weights reference back into
> `characters/chameli.json` as `lora_weights`, then generate the same 12 poses again with
> the LoRA applied and show me a before/after so I can see whether consistency actually
> improved. If it did not, say so plainly rather than moving on.

---

## 6 · Produce Kahani Episode 1

> Read `episodes/kahani-ep1.json` and `characters/chameli.json`.
>
> Produce this episode end to end:
> 1. Generate a still for each of the 9 shots using the LoRA.
> 2. Animate **only** the 3 shots with `"hero": true` using image-to-video — that is the
>    one genuinely expensive line. Every other shot is a still with the `motion` note
>    applied in Remotion (push-in, parallax, rain and wiper layers).
> 3. Narrate the Hindi `vo` lines. Use Sarvam if `SARVAM_API_KEY` is set; otherwise
>    `say -v Lekha -r 168` so I can at least judge the pacing.
> 4. Burn Hindi captions and assemble to 1080×1920, 30fps, 48 seconds, ending on the
>    `end_card`.
>
> Check each shot's VO against its time window and tell me which lines overrun before you
> render. Show me the finished video and the per-shot cost.

---

## 7 · Sketch episodes 2–5

> Read `docs/kahani-character-and-sample-reel.md` and `episodes/kahani-ep1.json`.
> Sketch episodes 2 through 5 in the same shape: one passenger, one secret, one
> destination that turns. For each, give me the logline, the twist, the destination, and
> the cliffhanger line only — not the full shot list yet.
>
> The format is the asset, not the episode. I want to see whether it holds for five before
> I shoot one.

---

## A note on running two sessions

Do not run two Claude Code sessions in the same project directory. `mkdir -p` succeeds
silently on an existing folder and one session will overwrite the other's `package.json`
and strip its `node_modules` without either noticing. Check `ls -lt` mtimes before
scaffolding into a directory that already exists.
