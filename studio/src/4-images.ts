/**
 * Stage 4 — images, not video.
 * timing.json -> images/<line>/f000.svg… + shots.json
 *
 * The whole visual layer is stills played back at a frame rate. A talking
 * character is 8 frames cycled at 8fps, not four seconds of generated video —
 * which is the difference between ~$0.03 and ~$2.00 a reel. Providers:
 *
 *   vector   local SVG. No key, no cost, deterministic. Default.
 *   flux     Replicate FLUX.schnell. ~$0.003 an image.
 *   pexels   stock stills. One per line, Ken Burns supplies the motion.
 */
import fs from "node:fs";
import path from "node:path";
import { renderDir, staticPath, slugArg, readJson, writeJson, ensure, requireEnv } from "./lib/paths.ts";
import { ScriptSchema, type Script, type Shot } from "./lib/schema.ts";
import { actorFor, sceneFrame, type Expression } from "./lib/vectorArt.ts";

const IMAGE_FPS = Number(process.env.IMAGE_FPS ?? 8);
const FRAMES_PER_LINE = Number(process.env.FRAMES_PER_LINE ?? 8);

type Timing = { id: string; speaker: string; expression: string; shot: string; start: number; end: number };

/**
 * Frames are a mouth-aperture ladder: frame 0 is closed, the last is wide open.
 * Stage 5 measures the narration's loudness per video frame and stage 6 picks the
 * rung — so the same eight stills read as speech instead of as a looping puppet.
 * A generated-image provider produces the same ladder, one prompt per rung.
 */
/** Which vector set to draw. The writer names the location; this picks the room. */
const SET: "stall" | "street" =
  /street|gali|lane|road|outdoor|diwali|night|मोहल्ला|गली|सड़क/i.test(process.env.SET ?? "") ? "street" : "stall";

const aperture = (f: number, total: number) => (total < 2 ? 0 : f / (total - 1));

function vector(script: Script, timing: Timing[], dir: string): Shot[] {
  const actors = script.characters.map((c, i) => actorFor(c.id, c.side, i));
  return timing.map((line, li) => {
    const outDir = ensure(path.join(dir, "images", line.id));
    const frames: string[] = [];
    for (let f = 0; f < FRAMES_PER_LINE; f++) {
      const svg = sceneFrame({
        actors,
        speaking: line.speaker,
        expression: line.expression as Expression,
        open: aperture(f, FRAMES_PER_LINE),
        blink: false,
        phase: li * 0.37,
        set: SET,
      });
      const name = `f${String(f).padStart(3, "0")}.svg`;
      fs.writeFileSync(path.join(outDir, name), svg);
      frames.push(name);
    }
    return {
      line: line.id,
      frames,
      fps: IMAGE_FPS,
      source: "local vector renderer",
      license: "original artwork, generated in-repo",
      credit: "reel-foundry",
    };
  });
}

async function flux(timing: Timing[], dir: string, script: Script): Promise<Shot[]> {
  const token = requireEnv("REPLICATE_API_TOKEN");
  const shots: Shot[] = [];
  for (const line of timing) {
    const outDir = ensure(path.join(dir, "images", line.id));
    const frames: string[] = [];
    for (let f = 0; f < FRAMES_PER_LINE; f++) {
      const mouth = ["mouth closed", "mouth barely parted", "mouth slightly open", "mouth open", "mouth open wide", "mouth wide open mid-vowel"];
      const prompt = `${line.shot}. ${script.setting}. flat vector illustration, warm palette, vertical composition, identical characters framing and camera in every frame, only the mouth differs: ${mouth[Math.round(aperture(f, FRAMES_PER_LINE) * (mouth.length - 1))]}`;
      const res = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "content-type": "application/json", Prefer: "wait" },
        body: JSON.stringify({ input: { prompt, aspect_ratio: "9:16", output_format: "jpg", num_outputs: 1 } }),
      });
      if (!res.ok) throw new Error(`Replicate ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const body = (await res.json()) as { output?: string[] };
      const url = body.output?.[0];
      if (!url) throw new Error(`Replicate returned no image for ${line.id} frame ${f}`);
      const img = await fetch(url);
      const name = `f${String(f).padStart(3, "0")}.jpg`;
      fs.writeFileSync(path.join(outDir, name), Buffer.from(await img.arrayBuffer()));
      frames.push(name);
      console.log(`  ${line.id} f${f}  ${line.shot.slice(0, 40)}`);
    }
    shots.push({ line: line.id, frames, fps: IMAGE_FPS, source: "replicate/flux-schnell", license: "check your Replicate terms", credit: "FLUX.1 schnell" });
  }
  return shots;
}

async function pexels(timing: Timing[], dir: string): Promise<Shot[]> {
  const key = requireEnv("PEXELS_API_KEY");
  const shots: Shot[] = [];
  for (const line of timing) {
    const outDir = ensure(path.join(dir, "images", line.id));
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(line.shot)}&orientation=portrait&per_page=${FRAMES_PER_LINE}`,
      { headers: { Authorization: key } },
    );
    if (!res.ok) throw new Error(`Pexels ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const { photos } = (await res.json()) as { photos: { src: { portrait: string }; photographer: string; url: string }[] };
    const frames: string[] = [];
    for (const [i, p] of photos.entries()) {
      const img = await fetch(p.src.portrait);
      const name = `f${String(i).padStart(3, "0")}.jpg`;
      fs.writeFileSync(path.join(outDir, name), Buffer.from(await img.arrayBuffer()));
      frames.push(name);
    }
    if (!frames.length) continue;
    // Stock stills are a slideshow, not an animation — hold each one for about a second.
    shots.push({ line: line.id, frames, fps: 1, source: "pexels", license: "Pexels License", credit: photos[0]?.photographer ?? "" });
  }
  return shots;
}

const slug = slugArg();
const dir = renderDir(slug);
const provider = process.env.IMAGE_PROVIDER ?? "vector";
const script = ScriptSchema.parse(readJson<Script>(path.join(dir, "script.json")));
const timing = readJson<Timing[]>(path.join(dir, "timing.json"));

console.log(`[4/6] images  ${slug}  (provider: ${provider}, ${FRAMES_PER_LINE} frames/line @ ${IMAGE_FPS}fps)`);
fs.rmSync(path.join(dir, "images"), { recursive: true, force: true });

const shots =
  provider === "flux" ? await flux(timing, dir, script)
  : provider === "pexels" ? await pexels(timing, dir)
  : vector(script, timing, dir);

// Rewrite frame names as paths Remotion's staticFile() can resolve.
const resolved = shots.map((s) => ({ ...s, frames: s.frames.map((f) => staticPath(slug, "images", s.line, f)) }));
writeJson(path.join(dir, "shots.json"), resolved);
console.log(`  ${resolved.length} shots, ${resolved.reduce((n, s) => n + s.frames.length, 0)} frames total`);
