# Depth and voice

Two complaints, two different causes. Neither is fixed by switching tools.

---

# Part 1 — why it looks flat

## It was not missing 3D. It was missing variety and parallax.

The first version pushed **every** still from scale 1.06 to 1.16, **linearly**, in the
same direction, for the whole segment. Eight segments of identical mechanical zoom is
what the eye reads as "slideshow" rather than "camera". Three changes fix it with no new
asset and no API call:

1. **Vary the move.** Six camera moves — push in, pull out, lateral pan, diagonal, tilt
   down, slow drift — picked by segment index. Deterministic, never twice the same in one
   reel.
2. **Ease it.** A real camera accelerates and settles. `Easing.bezier(0.22, 0.61, 0.36, 1)`
   instead of linear. Linear interpolation is the giveaway.
3. **Give it depth.** A blurred, larger background plate drifting *against* the sharp
   layer, plus a slight perspective rotation. Two planes at different speeds is parallax —
   the cheapest depth cue there is, and it also fills the 9:16 frame when the source image
   is landscape.

Implemented in `pipeline/src/remotion/components/BeatVisual.tsx`.

> A trap worth knowing: two `<Img>` at 100% height stack in normal flow, so the sharp
> plate gets pushed a whole frame down and only the blurred one is visible. Both plates
> must be `position: absolute`.

## Real 3D: three tiers, honestly costed

| Tier | What it is | Cost | Consistency |
|---|---|---|---|
| **2.5D parallax** (done) | Layered stills, varied eased moves | £0, no key | n/a |
| **Depth-map parallax** | Estimate a depth map per still, displace it in 3D | ~$0.01/still hosted | n/a |
| **Generated character** | Identity-locked stills → image-to-video, lip-synced to the VO | ~$0.10–0.50/clip | LoRA gives you the same face forever |
| **True 3D avatar** | A rigged model rendered in Three.js inside Remotion, driven by viseme data | £0 per frame after setup | Perfect, permanently |

**The last row is the one worth understanding.** Remotion renders through headless
Chrome, so `@remotion/three` puts a real WebGL scene on the timeline. A rigged avatar with
blendshapes, lip-synced from the narration, costs **nothing per frame** and is
*byte-identical* across a thousand episodes. No LoRA drift, no per-clip generation bill,
and you can change the camera, the lighting or the set without regenerating anything.

The trade is that it looks like a 3D character, not a photoreal person. For
[Kahani](kahani-character-and-sample-reel.md) that is a real choice, not a compromise —
stylised recurring characters are exactly what the platforms call authentic.

### This tier is built and shipped

`samples/bhabhi-patakha-3d.mp4` is that row, running. A rigged CC0 character composited
over the real footage, 24.8s at 1080×1920, rendered on an 8 GB M2 with **zero API calls
and zero spend**. Run it yourself:

```bash
npx tsx src/6-render.ts <slug> --3d
```

How it works, in `pipeline/src/remotion/components/Character3D.tsx`:

- **Nothing advances on wall-clock time.** Remotion renders frames out of order and in
  parallel, so the `AnimationMixer` is scrubbed with `setTime(frame / fps)` — never a
  delta inside `useFrame`. Get this wrong and the character stutters or freezes.
- **The camera is auto-framed.** FBX2GLTF leaves a large node scale on the model and the
  glTF accessor bounds are bind-pose only, so the only honest measurement is a `Box3` on
  the loaded scene. The model is normalised to a fixed world height and re-centred, so
  swapping the character does not mean re-tuning the camera.
- **Emotion drives the body.** The segment's `direction.emotion` selects both the
  animation clip and a facial morph target — `wry` leans on Sad at 0.28, `urgent` on
  Surprised at 0.4.
- **The mouth is driven by the caption timing.** This model has no visemes, so the head
  nods and the Surprised morph pulses while a word from `words.json` is on screen. At
  phone scale that reads as speech.
- **Two light sources.** Warm key, cool rim. A single light is what makes a 3D render
  look like a video-game screenshot.

**Two things that will stop you cold:**

1. **`Config.setChromiumOpenGlRenderer("angle")`** — without it every WebGL context fails
   to create and the render dies at frame zero. Remotion tells you, but only in the
   stack trace.
2. **`@react-three/fiber` v9 requires React 19.** On React 18 you must pin
   `@react-three/fiber@^8`, or npm refuses to resolve.

The character shipped here is a **placeholder** — `RobotExpressive.glb`, CC0 1.0, from the
three.js repo. It proves the stage end to end. Chameli should be authored in VRoid and
rigged through Mixamo so the studio owns her outright; dropping her in is a one-line
change to the `staticFile()` path.

## "Take some character from online" — read this first

**Do not lift an existing character.** A recognisable character from a film, show, game or
another creator's channel carries copyright and often trademark. Building a persona on one
is the fastest route to a channel strike, and it is the *opposite* of the originality moat
the PRD is built on. It also cannot be sold later.

Use a source that grants commercial rights:

| Source | What | Licence |
|---|---|---|
| **VRoid Studio** | Build your own stylised anime-style avatar, free desktop app | Yours; commercial use allowed |
| **Mixamo** (Adobe) | Auto-rigging plus a large mocap animation library | Free for commercial with an Adobe account |
| **Meshy** (pre-made Mixamo assets) | Ready avatars | **CC0** — no attribution, commercial safe |
| **Ready Player Me** | Avatar platform, free sample pack | Commercial use needs their partner form |
| **Sketchfab** | Filter to CC0 / CC-BY | Per-model; check each one |

For Chameli specifically: build her in **VRoid**, rig and animate through **Mixamo**,
render in **Remotion + Three.js**. She then exists as a file you own, not as a prompt you
hope reproduces.

## Talking heads, if you want photoreal instead

`Hedra` drives an expressive talking character from a single image plus an audio track —
head motion and expression, not just mouth. `Sync Labs` is the quality leader for pure lip
sync and visual dubbing. `Kling` has lip sync built into its video generation. All are
per-clip paid, and none give you Chameli's face twice unless you feed them the same
identity-locked still.

---

# Part 2 — why the voice sounds like AI

## The model is not the main problem. The writing is.

Narration sounds synthetic because the script was written to be **read** and then handed
to something that has to **speak** it. Long compound clauses, no breath points, every line
the same length — that sameness is what the ear hears as a machine. No voice model rescues
a line that does not breathe.

So direction happens in two places, in this order of impact:

### 1. The writing — free, and the biggest single win

- **Breath lines.** One idea per line. Read it aloud; if you run out of breath, split it.
- **Vary the rhythm.** Mix a four-word line against a fourteen-word one. If every line
  lands the same way, the delivery is flat no matter how good the voice is.
- **Punctuation is timing.** A comma is a micro pause the engine already honours. A full
  stop before the payoff is a reveal pause.
- **Spoken register, not written.** "जो कि", "के द्वारा", "in order to" — nobody says these.

This is now enforced in the stage-1 system prompt, and `breathCheck()` in
`pipeline/src/lib/voice-direction.ts` flags lines that will not survive synthesis.

### 2. The markup — per line, in the engine's own dialect

Every spoken line now carries a `direction`:

```json
{ "emotion": "wry", "emphasis": ["पहले"], "pause_before_ms": 500 }
```

- **`emotion`** — vary it across the script. Eight neutral lines is exactly what sounds
  like a robot. A counting beat is neutral; the line revealing the number is wry; the
  closing turn is warm.
- **`emphasis`** — at most two payoff words. Usually the number, the turn, or the
  contradiction. **Often the right answer is none: if everything is emphasised, nothing is.**
- **`pause_before_ms`** — 0 when the thought continues, 400–800 before a reveal or a
  punchline. **This pause is what buys a line its weight** — the difference between stating
  a fact and landing one.

`voice-direction.ts` emits that in two dialects:

**SSML** — for Sarvam, Google, Azure, Speechify:
```xml
<speak><break time="500ms"/><prosody rate="0.94" pitch="-4%">
और बोलीं — नहीं रे पगलों। अब <emphasis level="moderate">पहले</emphasis> जैसी बात कहाँ?
</prosody></speak>
```

**Audio tags** — for ElevenLabs v3, which reads bracketed cues as delivery instructions
(`[pause]`, `[wry]`, `[hesitates]`, `[deadpan]`, `[rushed]`, `[drawn out]`):
```
[pause] [wry] और बोलीं — नहीं रे पगलों। अब पहले जैसी बात कहाँ?
```

Prosody shifts are kept deliberately small (rate 0.90–1.08, pitch ±5%). Big swings sound
theatrical, which is its own tell.

## Which engine, for Hindi

**Sarvam Bulbul V3.** It is built on an LLM that infers prosody — emphasis, pauses, tone,
pacing — from meaning rather than processing words as a sequence, and it models Hindi
prosody natively: the rising-falling contour of North Indian speech, with stress spread
evenly across syllables rather than the English stress-timed pattern. That last point is
exactly why an English-trained voice reading Hindi sounds wrong even when the words are
right. 35+ voices from professional artists, 11 Indian languages. The pipeline now defaults
to `bulbul:v3`.

**ElevenLabs v3** for English personas, where the audio-tag system gives finer control.

**macOS `say` is a dead end** on the current laptop — over ten minutes per Hindi line in a
Rosetta shell, and it never picked a Hindi voice at all before this fix, so Devanagari went
to an English voice and came back near-silent.

## Sources

- [ElevenLabs — Audio tags 101](https://elevenlabs.io/blog/v3-audiotags) · [v3 audio tags: precision delivery control](https://elevenlabs.io/blog/eleven-v3-audio-tags-precision-delivery-control-for-ai-speech) · [TTS best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)
- [Sarvam — Bulbul V3](https://www.sarvam.ai/blogs/bulbul-v3) · [Bulbul model docs](https://docs.sarvam.ai/api/getting-started/models/bulbul)
- [Google Cloud — SSML reference](https://docs.cloud.google.com/text-to-speech/docs/ssml) · [Azure — SSML voice and prosody](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice)
- [Making AI voiceovers sound natural: pacing, pauses, emphasis](https://aivoicepedia.medium.com/how-to-make-ai-voiceovers-sound-natural-for-shorts-pacing-pauses-emphasis-cb9fc86aaa56) · [17 fixes for robotic TTS](https://queststudio.io/blog/how-to-make-ai-voice-sound-human)
- [Best AI lip sync tools 2026](https://morphic.com/resources/tools/best-ai-lip-sync-tools) · [AI video generators with lip sync](https://www.elser.ai/blog/best-ai-video-generators-with-lip-sync-in-2026-7-tools-for-talking-and-singing-characters)
- [Meshy — CC0 Mixamo assets](https://www.meshy.ai/tags/mixamo) · [Ready Player Me](https://discourse.threejs.org/t/free-3d-avatar-creator-tool-ready-player-me/30724)
