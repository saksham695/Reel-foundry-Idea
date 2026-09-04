# Reel Foundry

> An engine that turns a one-line topic into a running content persona.

Give it a topic. It proposes the angle and thirty ideas, then publishes reels, posts and
stories to Instagram, YouTube and Facebook every day — behind a one-key human gate.
We run our own personas on it first, then open it to anyone with a topic.

**Status:** spec complete, no code yet. Draft v0.2, 4 September 2026.

## The documents

| Document | What's in it |
|---|---|
| **[PRD + BRD](docs/prd-brd.md)** | The full spec: problem, persona lineup, pipeline, agents, platform, costs, roadmap, risks, and the revenue model |
| [PRD + BRD (original HTML)](docs/prd-brd.html) | The same document as originally published — download and open in a browser |
| **[Context and decisions](docs/context.md)** | How the lineup was chosen, what was rejected, and the constraints that shaped v0.2 |
| **[Kahani — character + sample reel](docs/kahani-character-and-sample-reel.md)** | Chameli, the first recurring character: locked identity, the image-first consistency pipeline, and Episode 1 shot by shot |

## The shape of it in one screen

**The lineup.** Bhakti (Hindi devotional), AI Tools (Hindi + English), Kahani (serialized
Hindi story with recurring characters), Comedy (conditional — original material only),
Fitness & Yoga, and Body Talk Men + Women (intimate-health education, strictest policy
pack, credited doctor). Scenery is b-roll only, never its own page.

**Start with three.** AI Tools, Kahani, Bhakti. The product layer comes only after
day-120 proof.

**Three things worth knowing before reading the rest:**

1. **Views and money are different axes.** The topics that get shared most in India reach a
   Hindi-speaking audience where YouTube Shorts pay ≈ $0.03 per 1,000 views. This plan
   chases those views on purpose but funds itself through sponsors, affiliate and long-form.
2. **A fully hands-off factory is what platforms now demonetize.** Original characters,
   original writing and a human gate are the moat — not polish.
3. **API access has a clock.** Meta Business Verification plus App Review, and a YouTube
   API compliance audit. Uploads from an unaudited project are locked private. File in
   week zero; ship a draft mode so nobody is blocked on it.

**Economics.** ≈ $25 variable cost per persona per month. ≈ $200/month to run five
personas build-first, against ≈ $1,040/month buying the equivalent tools.

**Stack.** TypeScript · Next.js · Remotion · Postgres · BullMQ · Claude Opus 5 ·
Kokoro (English TTS) / Sarvam Bulbul (Hindi TTS) · whisper.cpp · Pexels/NASA stock ·
direct Instagram Graph API + YouTube Data API · Cloudflare R2.

---

Owner: Saksham Kumar. Solo build.
