# Context and decisions

How Reel Foundry got to v0.2 — what was asked, what changed, and the constraints that
are now baked into the spec.

## The original ask

One pipeline, N persona configs, each with an Instagram and a YouTube account, producing
3–4 reels + 1 post + 2–3 stories per day, with a human approval gate and a nightly
analytics loop. The first cut of the lineup was Nutrition, Fitness, AI, Travel and
"unreal things".

## What changed in v0.2

The lineup was rebuilt after a simple observation: the reels that actually get shared in
India are devotional, running stories with recurring characters, comedy with good timing,
and scenery. Not generic niche accounts.

So the lineup became **Bhakti, AI Tools, Kahani, Comedy (conditional), Fitness & Yoga, and
Body Talk (Men) + Body Talk (Women)**. Scenery was demoted to b-roll and stories — it gets
huge views, sells nothing, and is the textbook case in Instagram's unoriginal-content
crackdown.

Two assumptions follow from that: the audience is **~90% India**, and Hindi TTS is
**Sarvam Bulbul**, not Kokoro. Kokoro stays for the English personas, where it costs $0.

## Positions taken, so they are not re-litigated

- **Start with three personas** — AI Tools, Kahani, Bhakti. AI Tools is the income
  persona, Kahani has the best policy standing, Bhakti is the reach engine.
- **The product layer comes after day-120 proof**, not before. Build the studio, prove it
  on our own personas, then sell it.
- **Build-first, not buy-everything.** ≈ $200/month for five personas versus ≈ $1,040
  buying ElevenLabs, Kling, Creatomate, Epidemic, Metricool, n8n cloud and Canva.
  ≈ $25 variable per persona per month is the floor for any product pricing.
- **Do not plan income on Shorts ads.** India RPM is ≈ $0.03/1k. Plan on long-form
  YouTube, affiliate and sponsors; those carry ~44% of the base case in months 7–12.
- **Twelve-month studio scenarios (5 personas, India-weighted):** base ≈ $27.7k/yr,
  conservative ≈ $4.25k, optimistic ≈ $77.5k.
- **Product pricing** (the SaaS layer, if it ships): ₹1,999 / ₹4,999 / ₹14,999.

## The critical path

**Meta App Review** (`instagram_content_publish`) and the **YouTube API compliance audit**.
Uploads from an unaudited YouTube project are locked private. Both are filed in week zero,
and the product ships a draft mode so no user is ever blocked waiting on them.

## The standing policy risk

YouTube's inauthentic-content policy operates at the **channel** level and, since July 2026,
names AI personas posing as health or religious authorities as a top target. That lands on
two personas at once:

- **Bhakti** — generated deity imagery can offend, bhajan audio triggers Content ID.
  Human gate mandatory; music licensed or original.
- **Body Talk** — the riskiest persona in the lineup. Survives only as unmistakably
  educational: a credited human doctor on the page, anatomical language only, diagrams
  never photographs, a "see a doctor" line in every caption, and **limited ads accepted by
  design** — modelled on sponsors and telehealth affiliate, never on ad revenue.

## Open when picked back up

Pick up from the roadmap in the [PRD](prd-brd.md). Don't re-derive the cost and revenue
model — update it with real day-30 data.
