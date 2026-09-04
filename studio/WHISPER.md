# Word-level captions with whisper.cpp

Free, local, no key. Two traps, both of which produce a *worse* reel than no whisper
at all if you walk into them.

## Install

```bash
arch -arm64 brew install whisper-cpp          # binary is `whisper-cli`
mkdir -p ~/models/whisper && cd ~/models/whisper
curl -L -O https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin
```

```env
WHISPER_CLI=/opt/homebrew/bin/whisper-cli
WHISPER_MODEL=/Users/you/models/whisper/ggml-large-v3-turbo.bin
```

## Trap 1 — never use `-ml 1` on a non-Latin script

`-ml 1` splits on *model tokens*. For Devanagari that cuts multi-byte characters in
half: `whisper.json` comes back **invalid UTF-8** and the captions render as broken
glyphs. It fails silently — the render succeeds and the video looks wrong.

Use whisper's natural segments instead. They are always whole text.

## Trap 2 — never burn whisper's transcription into the captions

Whisper is transcribing a synthetic voice. On the sample reel it heard **पताख्लों** for
पटाखों and **गूज** for गूँज. Ship that and the captions are simply wrong.

The script text is already known exactly. So take the **words from the script** and the
**clock from whisper** — `alignToScript()` resamples whisper's word starts onto the
known words, per line, falling back to proportional spacing when no whisper word lands
in a line. Real anchors, correct text.

## The three versions this produced

| | captions |
|---|---|
| v1 | even distribution — correct text, timings drift within a line |
| v2 | whisper `-ml 1` — **broken glyphs**, invalid UTF-8 |
| v3 | whisper segments + `alignToScript` — correct text, real timing |

All three are kept in `public/renders/<slug>/versions/`, which is why the regression in
v2 was visible at all.
