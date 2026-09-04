/**
 * Stage 4 — visuals.
 * timing.json -> assets/<segment>.(mp4|jpg) + manifest.json
 *
 * Stock only. Generated video is a v2 concern; the PRD's non-goal list is right
 * that stills with motion and stock footage carry the first ninety percent.
 * Every asset carries its licence line — that row is what makes a strike defensible.
 */
import fs from "node:fs";
import path from "node:path";
import { renderDir, staticPath, slugArg, readJson, writeJson, ensure, requireEnv } from "./lib/paths.ts";
import type { AssetRef } from "./lib/schema.ts";

type Segment = { id: string; visual_cue: string };
type PexelsVideo = { id: number; url: string; user: { name: string }; video_files: { link: string; width: number; height: number; quality: string }[] };
type PexelsPhoto = { id: number; url: string; photographer: string; src: { portrait: string; large2x: string } };

const KEY = requireEnv("PEXELS_API_KEY");
const headers = { Authorization: KEY };

async function download(url: string, out: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
}

/** Prefer a portrait file at least 1080 wide; fall back to the largest available. */
function bestFile(v: PexelsVideo) {
  const portrait = v.video_files.filter((f) => f.height > f.width);
  const pool = portrait.length ? portrait : v.video_files;
  return pool.sort((a, b) => {
    const score = (f: { width: number }) => (f.width >= 1080 ? f.width - 1080 : 10000 - f.width);
    return score(a) - score(b);
  })[0];
}

async function findVideo(query: string, dir: string, id: string): Promise<AssetRef | null> {
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=5`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Pexels videos ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const { videos } = (await res.json()) as { videos: PexelsVideo[] };
  if (!videos?.length) return null;
  const v = videos[0];
  const file = bestFile(v);
  const out = path.join(dir, `${id}.mp4`);
  await download(file.link, out);
  return { segment: id, kind: "video", file: `${id}.mp4`, source: v.url, license: "Pexels License (free to use, no attribution required)", credit: v.user.name };
}

async function findPhoto(query: string, dir: string, id: string): Promise<AssetRef | null> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=5`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Pexels photos ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const { photos } = (await res.json()) as { photos: PexelsPhoto[] };
  if (!photos?.length) return null;
  const p = photos[0];
  const out = path.join(dir, `${id}.jpg`);
  await download(p.src.portrait || p.src.large2x, out);
  return { segment: id, kind: "photo", file: `${id}.jpg`, source: p.url, license: "Pexels License (free to use, no attribution required)", credit: p.photographer };
}

const slug = slugArg();
const dir = renderDir(slug);
const assetDir = ensure(path.join(dir, "assets"));
const timing = readJson<Segment[]>(path.join(dir, "timing.json"));

console.log(`[4/6] visuals ${slug}`);
const manifest: AssetRef[] = [];
for (const seg of timing) {
  let asset = await findVideo(seg.visual_cue, assetDir, seg.id);
  if (!asset) asset = await findPhoto(seg.visual_cue, assetDir, seg.id);
  if (!asset) {
    console.log(`  ${seg.id.padEnd(7)} NOTHING FOUND for "${seg.visual_cue}" — rewrite the cue or drop in your own file`);
    continue;
  }
  manifest.push(asset);
  console.log(`  ${seg.id.padEnd(7)} ${asset.kind.padEnd(5)} ${seg.visual_cue}  (${asset.credit})`);
}

writeJson(path.join(dir, "manifest.json"), manifest);
console.log(`  ${manifest.length}/${timing.length} segments have a visual — staticFile base: ${staticPath(slug, "assets")}`);
