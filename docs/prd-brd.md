# Reel Foundry — PRD + BRD

**Draft v0.2 · 4 September 2026 · spec complete, no code yet**

An engine that turns a one-line topic into a running content persona: it proposes the
angle and thirty ideas, then publishes reels, posts and stories to Instagram, YouTube
and Facebook every day behind a one-key human gate. We run our own personas on it
first, then open it to anyone with a topic.

| | |
|---|---|
| Owner | Saksham Kumar (solo build) |
| Stack | TypeScript · Next.js · Remotion · Postgres · BullMQ |
| Our personas | Bhakti, AI Tools, Kahani, Comedy, Fitness & Yoga, Body Talk (Men), Body Talk (Women) |

## Read this before the rest

**Views and money are different axes.** The topics that get shared most in India (devotional, stories, comedy, scenery) reach a Hindi-speaking audience where YouTube Shorts pay about $0.03 per 1,000 views and Instagram pays close to nothing directly. This plan chases those views on purpose, but funds itself through sponsors, affiliate products, Facebook, and long-form YouTube.

**A fully hands-off factory is what platforms now demonetize.** YouTube's inauthentic-content policy works at the channel level and, since July 2026, names AI personas posing as health or religious authorities as a top target. Instagram cuts reach for unoriginal aggregators. Original characters, original writing, and a human gate are the moat, not polish.

**API access has a clock, and as a product it has a higher bar.** Publishing on behalf of other people needs Meta Business Verification plus App Review, and a YouTube API compliance audit. Uploads from an unaudited YouTube project are locked private. File in week zero; ship a draft mode so no user is ever blocked on it.

## Product requirements

## The problem, re-stated

What you asked, across three messages

"Create multiple agents, each with an Instagram page and YouTube channel, that post 3–4 reels, posts and stories every day. What will it take, what tools, what can we build ourselves, and what income does it generate?"

"The reels that actually get shared in big numbers are god reels, things you can do with AI, running stories with characters, emotional stories, Hindi jokes with good timing and animation, and beautiful unreal scenery. Add fitness and yoga."

"Make it software: people bring an idea for a new topic, the engine generates lots of ideas across it, and onboarding a new topic is hassle-free."

"Also one page each for men and women about the issues our body faces that we cannot share with anyone. A positive page, for teaching."

The sharper version

Build one **persona engine** and two things on top of it.

**The studio:** our own personas (Bhakti, AI Tools, Kahani, Comedy, Fitness & Yoga, and two Body Talk pages), each with an Instagram, YouTube and Facebook account, publishing 3–4 reels, a post and stories daily. This is the proof, the analytics source, and the marketing.

**The product:** a workspace where anyone types a topic in one sentence, gets three persona angles and thirty ideas in a minute, picks a voice and look from presets, connects accounts or stays in draft mode, and has a first day of content queued for review in under ten minutes. Same engine, same pipeline, their accounts, their approval queue, our billing.

The rule that makes both work: **a persona is data, never code.** Anything that needs an engineer to add a topic is a bug.

### Goals

- Topic to first reviewable queue in under 10 minutes with no engineer involved, for us or for a customer.

- Under 20 minutes of machine time and under 3 minutes of human time per persona per day.

- Nothing publishes without a human key for a persona's first 90 days. Auto-publish is earned per persona by approval rate.

- Every asset traceable: brief, sources, script version, voice, clips, music license, platform IDs, metrics.

- Category policy packs (religion, health, intimate health, finance, kids) applied automatically at onboarding so a customer cannot accidentally build a channel that gets struck.

### Non-goals for v1

- Generated video as the main visual. Stills with motion and stock footage carry 90% of reels; generated clips only for hero shots.

- Talking-head avatars. Faceless narration with characters and motion graphics avoids the "AI persona as authority" flag.

- Comment replies, DMs, follow/unfollow. Engagement automation is where accounts get banned.

- TikTok, X, LinkedIn. Three platforms is enough surface for v1.

- Marketplace for selling personas or scripts between users.

## Topic lineup and verdicts

Your feed instinct sets the lineup. Each topic is scored on the three axes that matter here: how much it gets watched and shared, what a view is worth, and how likely the platforms are to throttle it. Verdicts are for our studio; the product lets customers pick anything, with the policy pack applied.

| Persona | What it is | Views | Money per view | Policy risk | Verdict |
|---|---|---|---|---|---|
| **Bhakti** Hindi · devotional | Daily darshan, one shloka with meaning, festival explainers, short katha episodes. Original narration over stylised art, not a slideshow of scraped images. | Huge. Highest share rate in India; older audience forwards to family groups. | Low from ads. Real money is astrology and puja-product affiliate, sponsors from astrology apps, and Facebook, which pays Indian pages better than Instagram and holds this audience. | High. The most templated genre on the feed; bhajan audio triggers Content ID; generated deity images can offend. Human gate is mandatory, music must be licensed or original. | Go. Reach engine, cross-post to Facebook from day one. |
| **AI Tools** Hindi + English | "Things you can do with AI" in 45 seconds: one tool, one trick, screen recording plus narration. Hindi versions of English tutorials are underserved. | Strong and growing. | Highest of the lineup. SaaS affiliate pays 20–30% recurring; sponsors pay well; English variant reaches US RPM. | Low. | Go. Primary income persona. |
| **Kahani** Hindi · serialized story | A cast of recurring characters in short episodes: emotional arcs, twists, "part 2 tomorrow" hooks. Character consistency across images is the production problem to solve. | Strong once a character lands; drives follows better than any other format. | Medium. Ads plus memberships; high retention lifts the Shorts revenue share; episodes compile into long-form watch hours. | Lowest. Original characters and continuity are exactly what the platforms call authentic. | Go. Best policy standing of the lineup. |
| **Comedy** Hindi · character-led | A recurring comic character tells original jokes with timed punchlines and animation. Emotional and funny episodes can also live inside Kahani. | Strong. | Medium. Comedy is India's biggest sponsor category. | High if jokes are copied. "Convert all Hindi jokes to reels" is the reupload pattern the policy targets. Original writing only. | Conditional. Original material and a named character, or skip. |
| **Fitness & Yoga** Hindi + English | One move or one habit per reel, yoga flows for a specific problem (back pain, desk posture), 7-day challenges. Stock footage of real people; no generated bodies. | Good, with high saves. | Good. Equipment and app affiliate, a paid 12-week plan, sponsors. | Medium. Health claims are watched; no dosing, no diet cures, no before/after bodies. | Go. Health policy pack applied. |
| **Body Talk · Men** and **Body Talk · Women** Hindi + English · two separate accounts | The things people cannot ask anyone: intimate and sexual health, periods and PCOS, erectile and hair concerns, body odour, mental health, puberty. Clinical language, warm tone, sourced from WHO, ICMR and named guidelines. Diagrams and stylised illustration, never photographs. Every reel ends with when to see a doctor. | Very strong. The Hindi-language gap here is real and searches are enormous; women's health pages have the highest save and share rates of any category. | Good, but not from ads. YouTube's advertiser-friendly rules put sexual-health education in "limited ads" and may age-restrict it, which also drops a Short from the feed. Income is sponsors (men's wellness and femtech brands are among India's biggest creator advertisers) and telehealth affiliate. | Highest in the lineup. This is precisely the "AI persona as medical authority" pattern YouTube named in July 2026, and Instagram removes anything it reads as sexual solicitation. Survives only as unmistakably educational. | Conditional go. Strictest policy pack, a named human medical reviewer on the page, and accept limited ads by design. |
| **Scenery** beaches, sunsets, animals | Beautiful and unreal places and creatures. | Huge. | Lowest on the internet. Nothing to sell, nobody to sponsor. | Highest. Generated scenery is the textbook case in Instagram's unoriginal-content crackdown. | No page. Used as stories and b-roll inside other personas. |

What the Body Talk pages need that no other persona does

**Intimate-health policy pack.** Anatomical terms only, no slang; no explicit imagery, diagrams only; no product or cure claims; no dosing; a "this is education, see a doctor" line in every caption; nothing addressed to minors; no content that could read as solicitation. The QA agent enforces it, and the pack cannot be loosened.

**A real human on the page.** Credit a licensed doctor or counsellor as reviewer in the bio and on-screen once per reel. This is what separates health education from an AI posing as an authority, and it is also what sponsors ask for first.

**Separate accounts, separate voices.** The men's and women's pages have different questions, different sponsors, and a different narrator each. Keep them as two persona records sharing one policy pack and one source library.

**Plan for limited ads.** Model this persona on sponsors and telehealth affiliate, never on YouTube ad revenue, and set the altered-content and educational flags on every upload.

What changes when the audience is Hindi-speaking

Roughly 90% of viewers will be in India instead of the 60% the first draft assumed. That cuts every ad line by more than half, moves sponsors and Facebook to the front, and changes the voice stack: Kokoro is weak in Hindi, so narration moves to Sarvam's Bulbul or AI4Bharat's Indic Parler-TTS, with ElevenLabs as the paid fallback. The scenarios in Part 2 use India-weighted rates.

## What the studio produces

| Unit | Per persona / day | 5 personas / day | 5 personas / month | Length |
|---|---|---|---|---|
| Reels (one file to Instagram, YouTube Shorts, Facebook) | 3.5 | 17.5 | 525 | 30–60 s |
| Feed posts (carousel, 5–7 slides) | 1 | 5 | 150 | — |
| Stories (image or 15 s clip) | 2–3 | 12–15 | 375 | ≤ 15 s |
| Long-form YouTube (from month 3) | 1 / week | — | 20 | 6–10 min |

The money model in Part 2 runs at five personas at full cadence, which is the count the roadmap reaches by month four. The two Body Talk pages come after that; each extra persona at full cadence adds about $25 a month of cost and scales the view-driven lines roughly in proportion, while Body Talk's income comes from sponsors rather than ads.

The review queue is about 35 items a day at five personas. The approval screen must show the first frame, the hook, and the QA verdict, and accept one key to approve and one to reject with a note, or the human gate becomes the bottleneck. New accounts ramp from one post a day to full cadence over three weeks; the engine schedules this automatically.

## Daily pipeline, per persona

One pipeline, run once per persona per morning, for our personas and for every customer's. The amber box is the only place a human touches it. Rejections carry the reviewer's note back to the Writer so the second draft is not a re-roll.

- **Trigger**A BullMQ repeatable job per persona at 05:00 in the persona's timezone. Customers' personas are just more rows in the same queue.

- **Planner agent**Reads the persona's idea bank and memory (covered ideas, hooks that worked, dead formats), pulls fresh inputs (RSS, trends, the Hindu calendar for Bhakti, product launches for AI Tools), and emits 3–4 briefs with an angle and sources. For Kahani it also reads the story bible: characters, arcs, last episode's cliffhanger.

- **Writer agent**Turns each brief into strict-JSON: hook (first 2 seconds), 4–7 beats each with a visual cue, CTA, caption, hashtags, carousel and story variants. Writes in the persona's language and register.

- **Producers**Parallel workers: Hindi or English TTS; a visuals worker choosing stock clips, generating stills, or rendering the persona's recurring characters from reference images; whisper for word-level timestamps; a licensed-music picker. Each output is a file with a manifest line.

- **Renderer**Remotion composes the manifest into a 1080×1920 MP4 with animated captions, motion on stills, beat-synced cuts, and the persona's template. Post and story stills are frames from the same composition.

- **QA agent**Fresh context, adversarial prompt. Checks the category policy pack (religion: no claims of divine endorsement, no sectarian content; health: no dosing, no cures; intimate health: clinical terms, diagrams only, doctor line, nothing for minors; finance: no returns promised), facts against the brief's sources, similarity to the last 30 days, and sets the YouTube altered-content flag.

- **Human gate**Keyboard-driven queue per workspace. First frame, hook, QA verdict. Approve, or reject with a note that goes back to the Writer.

- **Publisher**Uploads to R2, creates Instagram and Facebook media containers from the public URL, uploads the YouTube Short with disclosure set, posts carousel and stories at the persona's windows. Respects the warm-up ramp and per-account daily caps. Retries with backoff; stores platform IDs.

- **Analyst**Nightly pull from Instagram Insights, YouTube Analytics and Facebook Page Insights. Writes metric rows and a one-paragraph note per persona the Planner reads next morning. Runs on the half-price batch endpoint.

## Onboarding a topic in under ten minutes

This is the product. Everything a customer does to go from "I have an idea" to "content is waiting for my review" is below, with a time budget per step. The same flow is how we add our own personas.

The amber step is the only one that can block, because it depends on the customer's accounts and Meta's review of ours. Draft mode makes it skippable: the persona runs, renders, and queues; the customer downloads files and posts by hand until accounts connect.

### What "hassle-free" means, concretely

- **One input.** A sentence like "Hindi reels about yoga for people with desk jobs." Optional: a link to a channel they admire, which the Architect uses only for format, never for content.

- **The Architect does the thinking.** It returns three persona angles (name, tone, target viewer, format), thirty ranked ideas with hooks, a suggested voice and look, an affiliate list, and the policy pack it detected (health, in this example). The customer picks, they do not configure.

- **Presets, not settings.** Eight voices per language, six visual templates, four music moods. Each with a 10-second preview rendered from the customer's own first idea.

- **Accounts are optional to start.** Draft mode ships every file to a download page. Connect later and the queue starts publishing.

- **The idea bank refills itself.** Thirty ideas seed the Planner; every night the Analyst tops the bank back up to thirty based on what worked. The customer can add, star, or kill ideas from a list.

- **Guardrails are applied, not chosen.** The policy pack is attached at onboarding and enforced by the QA agent. Customers see it, and can tighten it, but cannot remove it.

## Agents are config, not code

The Bhakti persona and a customer's "desk yoga" persona are the same six prompts and the same pipeline with a different persona record loaded. That is what makes topic onboarding a form instead of a project. A persona record looks like this:

`{
"id": "kahani",
"workspace": "studio",
"language": "hi",
"accounts": { "instagram": "ig-business-id", "youtube": "UC…", "facebook": "page-id" },
"voice": { "engine": "sarvam-bulbul", "id": "meera", "speed": 1.0 },
"look": { "template": "story-frames-v1", "palette": ["#101010", "#F6C453"], "music": "cinematic" },
"editorial": {
"tone": "warm narrator, short sentences, one twist per episode",
"story_bible": { "characters": ["Rohan", "Dadi", "Chintu"], "arc": "…", "last_cliffhanger": "…" },
"policy_pack": "general",
"banned": ["real brand names", "politics", "religion as plot device"],
"disclosure": { "youtube_altered_content": true }
},
"idea_bank": { "target": 30, "starred": ["…"], "killed": ["…"] },
"cadence": { "reels": 3, "posts": 1, "stories": 2, "windows_local": ["07:30", "13:00", "19:30"], "ramp_days": 21 },
"monetization": { "affiliate": [], "cta_every_n_reels": 5, "product": null },
"gate": { "mode": "human", "auto_publish_after_days": 90, "auto_publish_min_approval": 0.9 }
}`

| Agent | Model call | Reads | Writes | Why it is separate |
|---|---|---|---|---|
| Persona Architect | Claude Opus 5, adaptive thinking, web search tool, structured output | topic sentence, optional reference channel, policy pack library | 3 persona drafts, 30 ideas, policy pack id | Runs once at onboarding. Quality here decides whether the customer's first day impresses them. |
| Planner | Claude Opus 5, adaptive thinking | idea bank, memory, feeds, yesterday's Analyst note, story bible | 3–4 briefs (JSON) | Topic choice is where channels die. Keep it deliberate and inspectable. |
| Writer | Claude Opus 5, structured output | brief, persona editorial | script JSON | Voice consistency lives here. One prompt per persona style, versioned. |
| Producers | No LLM (TTS, stock, image gen, whisper) | script | files + manifest | Deterministic and cacheable. Rerun one worker without redoing the rest. |
| QA | Claude Opus 5, policy pack checklist, different prompt from the Writer | script, sources, last 30 days | pass/fail + reasons | A model checking its own draft in the same context is worthless. Fresh context, adversarial prompt. |
| Analyst | Claude Opus 5, batch API | platform metrics | metric rows, daily note, idea bank top-up | Runs overnight; latency irrelevant, so use the half-price batch endpoint. |

Everything is priced at Opus 5. QA and Analyst are the first candidates for Sonnet 5 once there is an approval-rate baseline to measure against. Persona prompts sit in a cached prefix so the per-run cost is mostly output tokens.

## The platform underneath

What has to exist so that a stranger can sign up, onboard a topic, connect accounts, be billed, and never see our other customers' data. This is the part the first draft did not have.

### Services

| Service | Does | Built with |
|---|---|---|
| Web app | Onboarding wizard, review queue, idea bank, persona settings, analytics, billing pages | Next.js, Auth.js (Google + email magic link), Tailwind |
| API | Persona CRUD, queue actions, webhooks from Meta and Google, usage metering | Next.js route handlers or a small Fastify service; Zod schemas shared with the workers |
| Orchestrator | Per-persona daily job, fan-out to producer jobs, retries, dead-letter queue | BullMQ on Redis; one queue per stage, concurrency per stage |
| Agent workers | Architect, Planner, Writer, QA, Analyst calls with prompt caching and structured output | TypeScript, Anthropic SDK |
| Producer workers | TTS, stock search, image and character generation, whisper timestamps, music pick | TypeScript wrappers; whisper.cpp binary; Sarvam, Pexels, Replicate clients |
| Render workers | Remotion renders; scale by adding machines | Remotion CLI in a container; CPU boxes, GPU not required |
| Publisher | Instagram, Facebook, YouTube publishing with per-account caps, warm-up, token refresh | Graph API and YouTube Data API clients; tokens encrypted at rest |
| Storage | Renders, stills, manifests; public URLs for Meta to fetch; lifecycle delete after publish | Cloudflare R2 |
| Database | All state, multi-tenant by workspace id on every row | Postgres (Neon or self-hosted), Drizzle |
| Billing | Plans, per-persona metering, invoices | Razorpay for India, Stripe for everyone else; usage events written by the orchestrator |
| Observability | Per-run traces, cost per reel, failure alerts | OpenTelemetry to a hosted collector; a cost column on every job |

### Data model

| Table | Key fields | Notes |
|---|---|---|
| workspace | id, plan, billing_customer_id, region | Tenant boundary. Every other table carries workspace_id. |
| user, membership | user_id, workspace_id, role (owner, reviewer) | Reviewers can approve; owners can change personas and billing. |
| persona | id, workspace_id, config (jsonb), status, gate_mode | The record shown in §6. Versioned on every edit. |
| account | persona_id, platform, external_id, token_ciphertext, expires_at, daily_cap, ramp_started_at | Instagram long-lived tokens expire in 60 days; YouTube uses refresh tokens. A refresh job runs daily. |
| idea | persona_id, text, hook, score, state (open, starred, used, killed) | The idea bank. Topped up nightly to the target. |
| run | persona_id, date, status, cost_cents | One per persona per day. Parent of everything below. |
| brief, script | run_id, idea_id, json, version, qa_verdict | Script versions survive rejections so the reviewer's note is attached to the next draft. |
| asset | script_id, kind (voice, clip, still, captions, music), url, license, source | License line is mandatory; the renderer refuses assets without one. |
| render | script_id, format (reel, post, story), url, duration, checksum | |
| review | render_id, user_id, decision, note, decided_at | Approval rate per persona is computed from here and drives auto-publish eligibility. |
| publication | render_id, account_id, scheduled_at, published_at, platform_media_id, error | Retries reference this row; caps are enforced by counting rows per account per day. |
| metric | publication_id, captured_at, views, watch_pct, saves, shares, clicks | Time series; the Analyst reads the last 30 days. |
| usage_event | workspace_id, kind (reel, long_form, tts_chars, image), quantity, cost_cents | Feeds billing and the per-reel cost dashboard. |

### Tenancy, security, compliance

- **Isolation:** workspace_id on every row, enforced in the query layer; per-workspace R2 prefixes; queue jobs carry the workspace id and the worker re-checks it.

- **Tokens:** encrypted with a per-workspace key; never logged; revocable from the UI; a nightly refresh job for Instagram long-lived tokens and YouTube refresh tokens.

- **Platform access as a product:** Meta Business Verification and App Review for `instagram_content_publish`, `pages_manage_posts`, and insights permissions, demonstrated with a real customer flow; YouTube API compliance audit and a quota increase request, since one Google project serves every customer's uploads. Both submitted in week zero.

- **Disclosure:** altered-content flag set on every YouTube upload; a per-persona disclosure line in captions where the policy pack requires it.

- **Data protection:** India's DPDP Act applies to customer data; keep the data inventory short, delete renders after publish, and offer workspace deletion in one click.

- **Abuse:** the policy packs are also our defence. A customer cannot onboard a persona that impersonates a real person or organisation, and the QA agent blocks it at script level.

## Build vs buy, stage by stage

Tags: build you write it, free open source or free tier you run, buy pay per use. Prices are list prices as of September 2026 and will drift.

| Stage | Paid route | Self-run route | Recommendation |
|---|---|---|---|
| Architect, Planner, Writer, QA, Analyst | Claude API, Opus 5 at $5 in / $25 out per million tokens. About $0.10 per reel across passes, half on the batch endpoint, less with cached persona prompts. | Local open models. Script quality is the product; not worth it. | buy Claude API, ~$10 per persona per month |
| Narration, Hindi | Sarvam Bulbul (Indian voices, pay per character), ElevenLabs (good Hindi, $99 Pro tier at our volume). | AI4Bharat Indic Parler-TTS (open source, needs a GPU box). | buy Sarvam per character; Indic Parler on a rented GPU once volume justifies it |
| Narration, English | ElevenLabs, OpenAI TTS. | Kokoro-82M (Apache-2.0), runs on CPU, near-ElevenLabs quality for narration. | free Kokoro |
| Visuals, general | Generated video (Kling, Runway, Veo) at $0.05–0.75 per second. Image gen via Replicate (Flux) ≈ $0.003 per image. | Pexels and Pixabay APIs for stock; Flux locally on Apple silicon. | free stock plus generated stills with motion |
| Visuals, recurring characters (Kahani, Comedy) | Reference-conditioned image models (Flux Kontext, Kling Elements) to keep a character consistent across frames. | A small LoRA per character on Flux, trained once from 20 reference images. | build one LoRA per character; ≈ $5 to train, then stills at $0.003 |
| Visuals, Bhakti | — | Commissioned or generated stylised art, reviewed once and reused as a persona asset library. Never scraped temple photos. | build a curated library per deity and festival |
| Captions with word timing | Descript, CapCut Pro (no API). | whisper.cpp on the narration file; Hindi works with the large model. | free whisper.cpp |
| Composition | Creatomate, Shotstack ($50–150/mo). | Remotion (React). Free under four people; a company licence once the product has staff. | build Remotion templates, six presets |
| Music | Epidemic Sound $15/mo, Suno $10/mo. | YouTube Audio Library and Pixabay Music, license line stored per asset. | free libraries; for Bhakti, commission original instrumentals once |
| Publishing | Buffer, Later, Metricool: $15–60/mo and they still need the same Meta approvals. | Instagram and Facebook via the Graph API, YouTube via the Data API. About 400 lines of TypeScript. Postiz (AGPL) as a reference implementation. | build direct API clients |
| Orchestration | n8n cloud, Trigger.dev cloud, Inngest ($25–100/mo at volume). | BullMQ on Redis; Trigger.dev self-hosted if you want run history for free. | build BullMQ |
| Review queue, onboarding wizard, idea bank | Nothing fits this shape. | Next.js. | build |
| Auth and billing | Clerk ($25+/mo), Stripe and Razorpay (per transaction). | Auth.js; Razorpay and Stripe SDKs. | free Auth.js, buy payment fees only |
| Storage | S3 with egress fees. | Cloudflare R2: 10 GB free, zero egress. | free R2, delete after publish |
| Analytics | Metricool, Sprout ($100+/mo). | Platform insight APIs into Postgres; a Next.js page on top. | build |
| Compute | — | Hetzner CPX41 for app, Postgres, Redis (≈ $30); a second CPX41 for renders (≈ $30). Add render boxes per 10 customer personas. | buy two VPS to start |

## Costs

### Per persona per month at full cadence (105 reels, 30 posts, 75 stories)

| Line | USD | Note |
|---|---|---|
| Claude API, all agents | 10 | Cached persona prefix, batch for Analyst |
| Hindi TTS (Sarvam), ≈ 70k characters | 6 | Estimate; Kokoro makes English personas $0 |
| Images, ≈ 600 stills | 2 | Flux on Replicate |
| Render compute share | 6 | ≈ 4 hours of CPU per persona per month |
| Storage and egress | 1 | R2 with lifecycle delete |
| Variable cost per persona | ≈ 25 | ≈ ₹2,100. This is the floor for product pricing. |

### Our studio, five personas

| Line | Build-first (USD) | Buy-everything (USD) |
|---|---|---|
| Variable cost, 5 personas | 125 | 125 |
| ElevenLabs instead of Sarvam and Kokoro | 0 | 99 |
| Generated video hero clips (Kling), two per reel | 0 | 550 |
| Creatomate, Epidemic, Metricool, n8n cloud, Canva | 0 | 190 |
| Two VPS, Redis, Postgres | 60 | 60 |
| Domain, email, observability | 15 | 15 |
| Total per month | ≈ 200 | ≈ 1,040 |

Not on the table: your time. About eight weeks to a working studio with three personas, another six to eight to the product layer, then roughly 30 minutes a day of review for our personas.

## Roadmap

- Week 0

**Paperwork before code**Business accounts and linked Pages for Bhakti, AI Tools and Kahani. Meta app: Business Verification and App Review for publishing and insights. Google Cloud project: Data API, OAuth consent, compliance audit. All three clocks start now.

- Weeks 1–2

**One persona end to end, manual upload**Start with AI Tools: Planner and Writer prompts, Kokoro narration, whisper captions, one Remotion template, files on disk. Post one reel a day by hand and watch retention.

- Weeks 3–4

**Queue, publisher, second and third personas**Approval UI, R2, Instagram and Facebook publish, YouTube upload (private until the audit clears). Add Kahani and Bhakti as config only, with Sarvam narration and the religion policy pack. If a new persona takes more than a day, the abstraction is wrong.

- Month 2

**Close the loop**QA agent, Analyst, memory, idea-bank top-up. Ramp all accounts to full cadence. Add Fitness & Yoga. Comedy only if you have a character and a week of original jokes.

- Month 3

**Monetization layer**Weekly long-form per persona. Affiliate links in bios, pinned comments, descriptions. Facebook Page monetization application for Bhakti. First day-60 kill-or-keep decisions. Add the two Body Talk pages once a medical reviewer has agreed to be credited; they start at one reel a day.

- Months 4–5

**Product layer**Workspaces, Auth.js, the Persona Architect, the onboarding wizard with presets and previews, draft mode, Razorpay and Stripe, usage metering. Re-run our own personas through the wizard as the acceptance test.

- Month 6

**Private beta**Ten creators recruited from our own channels' audiences. Free for 30 days in exchange for weekly calls. Meta App Review resubmitted with real customer flows if the first pass was scoped to us.

- Month 7+

**Paid launch**Pricing from §14. Our studio channels are the marketing: every long-form video ends with "made with the engine you can use".

## Risks and how the design answers them

| Risk | Likelihood | Mitigation built into the product |
|---|---|---|
| Channel-level inauthentic-content demonetization on YouTube, reach cuts on Instagram | High if ignored | Original characters and writing, distinct template per persona, 30-day similarity check, never the same reel across personas, human gate, long-form originals, disclosure set. |
| Devotional content offends or gets flagged | Medium | Religion policy pack: no claims of divine endorsement, no sectarian comparison, curated art library reviewed by a human once, no bhajan audio without a licence. |
| Fitness or Yoga reads as medical advice | Medium | Health pack: no dosing, no cures, no before/after bodies, "consult a professional" line, sources on screen. |
| Body Talk pages age-restricted, removed as sexual content, or flagged as an AI medical authority | High | Intimate-health pack enforced by QA; a credited human medical reviewer; diagrams only; educational framing in the first two seconds; income modelled on sponsors, not ads; the persona pauses on the first warning rather than the first strike. |
| Comedy persona drifts into copied jokes | High | QA similarity check against a corpus of common Hindi jokes; the persona is killed if originality fails twice. |
| Customers onboard a persona that impersonates someone or violates policy | Medium | Architect refuses impersonation at onboarding; policy packs cannot be removed; QA blocks at script level; we can suspend a workspace. |
| New accounts flagged as spam by cadence | Medium | Automatic three-week ramp, jittered windows, no engagement automation. |
| Meta App Review or Business Verification delayed or rejected | Medium | Submit week 0; draft mode means every persona still runs; resubmit with real customer flows at beta. |
| YouTube uploads locked private until audit | Certain at first | Manual upload from the review UI in month one; API once audited. |
| One Google project's quota shared across all customers | Certain at scale | Quota increase request after audit; a second project per 50 personas. |
| Character consistency in Kahani breaks and the story looks like a different cast each day | Medium | One LoRA per character, fixed seeds per scene type, a "cast sheet" the reviewer sees on every episode. |
| Building the product before the studio proves the engine | High | The roadmap puts the product layer in month four, after day-60 and day-90 data exist. |

## Business requirements

## Where money comes from, per platform, for a Hindi-first audience

| Stream | Platform | Gate to unlock | Rate assumption used below | Weight |
|---|---|---|---|---|
| Sponsored reels | All three | Practically 50k+ followers on a page; astrology, fantasy gaming, fintech, edtech, men's wellness and femtech brands buy heavily in India | ₹15,000 (≈ $180) per deal at our stage | Primary |
| Affiliate and CPA | All three (bio link, pinned comment, description) | None | One conversion per 10,000 views, $4 average payout (astrology-app installs, puja products, SaaS, fitness gear) | Primary |
| Long-form ads | YouTube | Partner Program: 1,000 subscribers and 4,000 watch hours in 12 months | India ≈ $1.00 per 1k views, US ≈ $5; blended $1.40 at 90/10 | Secondary |
| Shorts ads | YouTube | Partner Program via 10M Shorts views in 90 days (20M from Feb 2027), or the long-form route | India $0.03, US $0.20; blended $0.047 | Bonus |
| Facebook Reels and in-stream ads | Facebook | Page monetization eligibility; India included, selective | $0.02 per 1k Facebook views, on half of reel views | Secondary for Bhakti |
| Instagram ads, gifts, bonuses | Instagram | Eligibility-based; the old Reels bonus is invite-only | $0 | Ignore |
| Memberships, digital products | YouTube, own site | Partner Program for memberships; none for products | Not modelled; upside for Fitness (plans) and Kahani (early episodes) | Later |

## Studio income, twelve months, India-weighted

Five personas at full volume: 525 reels and 20 long-form videos a month, 90% Indian audience. The scenarios differ only in average views per item and how soon channels clear the Partner Program. Mass-appeal Hindi topics justify higher view assumptions than the first draft, and the per-view rates are lower. Every number is a placeholder for day-30 data.

| Assumption | Conservative | Base | Optimistic |
|---|---|---|---|
| Avg views per reel, months 1–3 / 4–6 / 7–12 | 2k / 6k / 15k | 5k / 20k / 60k | 15k / 60k / 150k |
| Avg views per long-form, same phases | 1k / 3k / 8k | 2k / 8k / 25k | 5k / 20k / 60k |
| Partner Program reached | 2 channels, month 10 | 2 in month 5, all by month 8 | all by month 5 |
| Sponsored reels per month, phases 1 / 2 / 3 | 0 / 0 / 1 | 0 / 1 / 3 | 1 / 4 / 8 |
| Facebook ads | 0 | $0.02 per 1k | $0.02 per 1k |

Conservative
Base
Optimistic

Monthly studio income run-rate (USD, all streams) by phase. Base bars are labelled; hover any bar for its value. The spread is almost entirely average views per reel, which is a quality problem, not a volume problem.

| Monthly run-rate, USD | Months 1–3 | Months 4–6 | Months 7–12 | 12-month total |
|---|---|---|---|---|
| Conservative | 45 | 130 | 620 | ≈ 4,250 |
| Base | 130 | 900 | 4,100 | ≈ 27,700 |
| Optimistic | 580 | 3,670 | 10,800 | ≈ 77,500 |
| Run cost, build-first | 200 | 200 | 200 | ≈ 2,400 |

### How the base case splits in months 7–12

| Stream | Volume | USD / month | Share |
|---|---|---|---|
| Shorts ads | 31.5M views × $0.047, 90% of channels eligible | 1,330 | 32% |
| Affiliate and CPA | 32M views × 0.01% × $4 | 1,280 | 31% |
| Long-form ads | 500k views × $1.40, same eligibility | 630 | 15% |
| Sponsored reels | 3 × $180 | 540 | 13% |
| Facebook ads | 15.75M views × $0.02 | 315 | 8% |
| Total | | ≈ 4,100 | 100% |

Compared with the first draft, the total is about the same but the shape is different: the Hindi lineup needs roughly twice the views to earn the same money, and sponsors plus affiliate carry 44% of it. Long-form still earns 15% of income on 2% of views, so the weekly long-form video stays the most valuable single item.

Break-even on cash cost lands in month five in the base case and month eleven in the conservative case, before counting your time. The conservative case pays under ₹300 an hour for the review work, which is the honest signal to stop at the day-90 gate if the numbers look like that.

## Product revenue

The studio is the proof and the marketing. The product is where the business scales, because a customer's persona costs us about $25 a month to run and we do not depend on their views at all. Pricing is set from that floor.

| Plan | Price / month | Includes | Our cost | Gross margin |
|---|---|---|---|---|
| Starter | ₹1,999 (≈ $24) | 1 persona, 1 reel + 1 story a day, draft mode or connected, human gate | ≈ $9 | ≈ 62% |
| Creator | ₹4,999 (≈ $60) | 2 personas, 3 reels + post + stories a day, analytics loop, idea bank | ≈ $45 | ≈ 25% at full use, ≈ 55% at typical use |
| Studio | ₹14,999 (≈ $180) | 5 personas, full cadence, long-form weekly, reviewer seats, auto-publish once earned | ≈ $125 | ≈ 30% at full use, ≈ 60% at typical use |
| Overage | ₹25 per extra reel | Metered from usage events | ≈ $0.24 | ≈ 20% |

Margins assume Opus 5 throughout and Sarvam for Hindi. Typical use in creator tools runs at 40–60% of plan capacity, which is where the realistic margins sit. If margins matter more than the last increment of script quality, QA and Analyst on Sonnet 5 add roughly 10 points.

### Twelve months from paid launch (month 7 of the roadmap)

| Assumption | Conservative | Base | Optimistic |
|---|---|---|---|
| Paying workspaces at month 12 after launch | 20 | 100 | 400 |
| Average revenue per workspace per month | $35 | $48 | $55 |
| Monthly churn | 10% | 6% | 4% |
| MRR at month 12 after launch | ≈ $700 | ≈ $4,800 | ≈ $22,000 |
| Gross margin at typical use | 50% | 55% | 60% |
| Fixed platform cost per month | $150 | $400 | $1,200 |

The base case is one hundred paying creators, which five studio channels with a combined audience in the hundreds of thousands can plausibly send. That is why the roadmap does not build the product first: the studio is the distribution, and distribution was the missing piece in every earlier plan.

Customer acquisition beyond our own audience is not modelled. The obvious channel is the product itself: a "made with" end card on every customer reel in Starter, removable on paid tiers.

## Decision gates and KPIs

| When | Metric | Keep going if | Otherwise |
|---|---|---|---|
| Day 30 | Average views per reel on the best persona, average watch percentage | ≥ 2,000 views and ≥ 60% watched | Rewrite hooks and template before adding any volume |
| Day 30 | Human approval rate | ≥ 80% | Fix the Writer or QA prompt; never tune by adding reels |
| Day 60 | Per-persona average views | Kill any persona under 1,000; promote the winner to two more reels a day | Redirect the freed cadence |
| Day 90 | Partner Program progress on the best channel; first sponsor inquiry | ≥ 1,000 subscribers or ≥ 1,000 watch hours; ≥ 1 inbound | Long-form is not landing; change the long-form format |
| Day 90 | Affiliate or CPA clicks per 1,000 views | ≥ 2 | Move the CTA earlier and into the pinned comment; test product fit |
| Day 120 | Go / no-go on the product layer | Two personas above 5,000 average views and zero strikes | Stay a studio; the product without proof is a hard sell |
| Beta, day 30 | Onboarding time to first queue; beta users still active | Median under 10 minutes; ≥ 6 of 10 active | Fix the wizard before pricing anything |
| Launch + 90 | Paying workspaces, monthly churn | ≥ 25 paying, churn under 8% | Talk to every churned user before spending on acquisition |
| Always | Policy strikes, reach-limit warnings, on ours or a customer's persona | Zero | Pause the persona, review the last 30 scripts, tighten the pack |

Recommendation

File the Meta and YouTube paperwork this week. Build the engine around three personas: AI Tools for income, Kahani for originality, Bhakti for reach, each a config file. Add Fitness & Yoga in month two, the Body Talk pages in month three once a doctor agrees to be credited, and Comedy only with a character and original material. Prove the engine on your own channels for 120 days, then wrap it in the onboarding wizard and sell it to the audience those channels built.

Sources checked 4 Sep 2026

- YouTube Shorts RPM by country and YouTube pay in India for per-1k-view rates.

- YouTube Partner Program requirements 2026 and policy change timeline for thresholds and the inauthentic-content policy.

- YouTube Data API quota and compliance audits for the upload cost and the private lock on unaudited projects.

- Instagram Reels API publishing guide and Instagram API rate limits for publishing caps.

- Instagram Reels bonus in India 2026 and Instagram monetization India 2026 for Instagram payout status.

- Postiz on GitHub as the open-source publishing reference.

- YouTube advertiser-friendly content guidelines for the limited-ads treatment of sexual-health education.

- Claude API pricing from the Anthropic pricing page as cached in this session's tooling. Sarvam, Replicate and Hetzner prices are list estimates and should be re-checked before pricing plans.
