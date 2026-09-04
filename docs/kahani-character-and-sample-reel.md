# Kahani — the character, and one sample reel

The first character for the Kahani persona, the pipeline that keeps her looking like
herself across episodes, and Episode 1 specified shot by shot.

## Why image-first is the right call

Text-to-video drifts. Ask any model for "the same woman" twice and you get two women —
different jaw, different nose, different age. For a **serialized** persona, where the
whole premise is that people come back for a face they recognise, that drift is fatal.

So: **lock the face in stills, then animate the stills.**

```
character sheet (stills)  ->  per-shot stills  ->  image-to-video on 3 hero shots
       identity                  composition            motion, only where it earns its cost
```

Three ways to hold identity, in the order you should adopt them:

| Stage | Method | When | Cost |
|---|---|---|---|
| Episode 1 | One reference image + fixed prompt tokens + fixed seed | Right now, to get moving | ≈ $0.01/still |
| Episode 2–5 | Reference-image conditioning (IP-Adapter / character reference) off the sheet | Once the sheet exists | same |
| Episode 6+ | **A LoRA trained on 20 approved stills of her** | The end state for any recurring character | ≈ $2 one-time, then free |

Train the LoRA on stills you have already approved from episodes 1–5. That is the whole
trick: the first five episodes pay for the consistency of the next five hundred.

**Animate sparingly.** Image-to-video is the one genuinely expensive line in the whole
studio (the spec budgets $550/month for two generated clips per reel across five
personas). Use it on **3 hero shots per episode**. Everything else is a still with a slow
push-in, a parallax layer and a rain or headlight overlay in Remotion — free, and at
9:16 on a phone nobody can tell.

---

## The character

### Chameli — the night-shift auto driver

**One line:** A 26-year-old woman who drives an auto-rickshaw through Lucknow between
10pm and 5am. Every episode is one passenger and one secret.

**Why this character and not another:**

- **The format is infinite.** One passenger, one secret, one twist. It never runs out, and
  every episode is self-contained while the cliffhanger still pulls to tomorrow.
- **It is cheap to render.** Three recurring sets — auto interior, wet night street,
  one destination. Recurring sets mean recurring prompts, which means consistency comes
  almost free.
- **It is the lowest-risk thing in the lineup.** An original character with original
  writing and visible continuity is precisely what the platforms call authentic. No deity
  imagery, no health claims, no borrowed jokes.
- **She carries the audience Bhakti reaches.** Emotional, family-adjacent, forwarded to
  WhatsApp groups.

### Locked identity tokens

Paste these into **every** image prompt, unchanged, forever. This block is the character.

```
Chameli, 26-year-old Indian woman, oval face, warm brown skin, thick straight
black hair pulled into a low knot with a stray strand at the left temple, dark
almond eyes, small mole below the right eye, straight nose, full lips, small
silver nose stud on the left, single thin gold ring in each ear
```

**Wardrobe (fixed):** faded olive-green kurta over dark jeans, a maroon shawl looped once
around the neck, worn brown leather sandals, a steel watch on the left wrist.

**Never changes:** the mole, the nose stud, the stray strand at the left temple, the
maroon shawl. If a still gets those four wrong, discard it — do not let it into the LoRA
set.

**The auto (also a character):** black-and-yellow, a small Hanuman idol on the dash, a
string of dried marigold over the mirror, a cracked left rear-view mirror, sticker on the
back reading "माँ का आशीर्वाद".

**Voice:** Hindi, low and unhurried, a little tired. Sarvam Bulbul, female, warm register,
speed 0.95. She narrates in first person, past tense, as if telling you this after the
shift. She never explains the twist — she lets you catch it.

**The three sets:**
1. **Auto interior, night** — dashboard glow, Hanuman idol, marigold, rain on the windscreen
2. **Wet Lucknow street, 2am** — sodium streetlights, closed shutters, standing water, no crowds
3. **The destination** — changes every episode. This is where the twist lives.

### The character sheet — build this first

Twelve stills, one session, same seed, only the instruction after the locked block changes:

1. Front, neutral · 2. Front, faint smile · 3. Three-quarter left · 4. Three-quarter right
5. Profile left · 6. Looking up into the rear-view mirror · 7. Eyes down, tired
8. Laughing · 9. Afraid, jaw tight · 10. Full body, standing beside the auto
11. Seated at the handlebars from the passenger seat · 12. Face lit only by the dashboard

Keep the 8 that agree with each other. Those 8 are your reference set, and the seed
of the LoRA later.

---

## Episode 1 — "पीछे मत देखना" (Don't look back)

**48 seconds · 9 shots · Hindi VO, burned Hindi captions · cliffhanger to Episode 2**

**The turn:** a frightened man asks her not to look behind her. You expect a ghost. It is
a birthday tiffin for a daughter who is not alive.

### Shot list

| # | Time | Shot | Motion | VO (Hindi) |
|---|---|---|---|---|
| 1 | 0:00–0:03 | Chameli's face, lit only by the dashboard, eyes to camera | **Hero — image-to-video.** Micro head-turn, one blink | "रात के दो बजे एक सवारी ने मुझसे कहा — दीदी, पीछे मत देखना।" |
| 2 | 0:03–0:08 | Empty wet street, her headlight the only light | Still + slow push-in, rain overlay | "लखनऊ की सड़कें दो बजे खाली हो जाती हैं। मैं खाली ही चलती हूँ।" |
| 3 | 0:08–0:14 | A man, about fifty, gets in. He is holding a steel tiffin with both hands | Still + parallax | "वो हाथ में एक टिफ़िन लिए बैठा। दोनों हाथों से पकड़े हुए, जैसे कोई गिर न जाए।" |
| 4 | 0:14–0:20 | Over-shoulder from the front seat, his face half-lit | Still + slow drift | "बोला — चलिए दीदी। और पीछे मत देखना।" |
| 5 | 0:20–0:27 | The cracked rear-view mirror. Her eyes flick up | **Hero — image-to-video.** Eyes rise to the mirror, hold | "मैंने देख लिया। पीछे कोई नहीं था। सिर्फ़ वो, और वो टिफ़िन।" |
| 6 | 0:27–0:34 | Rain harder on the windscreen, wipers, his hands on the tiffin | Still + rain and wiper layers | "आज मेरी बेटी का जन्मदिन है, उसने कहा। उसे खीर बहुत पसंद है।" |
| 7 | 0:34–0:41 | The auto stops. Not a house — an iron cemetery gate | **Hero — image-to-video.** Slow reveal as the gate comes into frame | "मैंने पता पूछा नहीं था। उसने बताया भी नहीं था।" |
| 8 | 0:41–0:46 | He walks in. The tiffin is still on the back seat | Still + push-in on the tiffin | "वो उतर गया। टिफ़िन वहीं रह गया।" |
| 9 | 0:46–0:48 | Black. Text card | Static | — |

**End card:** `कल — टिफ़िन के अंदर क्या था।` (Tomorrow — what was inside the tiffin.)

### Per-shot image prompt (the pattern)

Every prompt is the **locked block**, then the shot, then the fixed style tail. Shot 5:

```
<LOCKED IDENTITY BLOCK>
seated at the handlebars of a black-and-yellow auto-rickshaw at night, seen in a
cracked rear-view mirror, her eyes raised to the mirror, dashboard light warm on
her face from below, small Hanuman idol and dried marigold garland out of focus
in the foreground, rain on the windscreen behind her
--- style: cinematic still, 9:16 vertical, shallow depth of field, sodium-vapour
streetlight and warm dashboard glow, muted teal and amber, film grain, no text
--- seed: <FIXED>
```

Change only the middle paragraph, shot to shot. Never the first block, never the tail,
never the seed.

### Production

| Step | Tool | Note |
|---|---|---|
| Stills | Flux (Replicate) | 9 shots × ~4 tries = ≈ 36 images ≈ $0.20 |
| Hero motion | Image-to-video, shots 1, 5, 7 | 3 clips. The only real cost in the episode |
| The other 6 shots | Remotion | Push-in, parallax, rain and wiper layers over the stills |
| Voice | Sarvam Bulbul, Hindi female | ≈ 340 characters ≈ $0.03 |
| Captions | whisper.cpp word timings → Remotion | Burned in, bottom third, one line at a time |
| Music | Licensed or original only | **Never** a film or bhajan track — Content ID |
| Gate | Human, one key | Before anything is published |

### Why this episode is safe

Original character, original writing, no real person, no health or religious claim, no
scraped footage, no borrowed audio. Continuity is visible on the page. This is the
persona in the lineup with the strongest standing, and Episode 1 is built to keep it.

### If it works

Episodes 2–5 are the same shape: one passenger, one secret, one destination that turns.
Sketch them before shooting Episode 1 — the format is the asset, not the episode. After
Episode 5, train the LoRA on the 20 best approved stills of Chameli and the marginal cost
of every future episode drops to voice and render.
