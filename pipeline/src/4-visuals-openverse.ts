/**
 * Stage 4 — visuals, keyless.
 * timing.json -> assets/<segment>.jpg + manifest.json
 *
 * Openverse instead of Pexels: no API key, and every result carries a real CC
 * licence. Stills only — stage 6 gives them motion, which is what the PRD's
 * "stills with motion carry the first ninety percent" already assumed.
 *
 * The licence and credit rows are not decoration. They are what makes a
 * takedown defensible, so an asset with no attributable licence is dropped
 * rather than used.
 */
import fs from "node:fs";
import path from "node:path";
import { renderDir, slugArg, readJson, writeJson, ensure } from "./lib/paths.ts";
import type { AssetRef } from "./lib/schema.ts";

type Segment = { id: string; visual_cue: string };
type OVResult = {
  id: string; title?: string; url: string; foreign_landing_url?: string;
  license: string; license_version?: string; creator?: string;
  width?: number; height?: number;
};

const UA = { "User-Agent": "reel-foundry/0.1 (personal project)" };

/** CC licences we will actually ship. Anything else is not worth the risk. */
const USABLE = new Set(["cc0", "pdm", "by", "by-sa"]);

async function download(url: string, out: string) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) throw new Error("suspiciously small image");
  fs.writeFileSync(out, buf);
}

/** Prefer tall images — the canvas is 1080x1920, so portrait crops best. */
function rank(r: OVResult) {
  const w = r.width ?? 1, h = r.height ?? 1;
  const ratio = h / w;                       // >1 is portrait
  const size = Math.min(w, h);
  return (ratio >= 1 ? 0 : 1000) + Math.abs(ratio - 1.4) * 100 - Math.min(size, 2000) / 1000;
}

async function search(query: string): Promise<OVResult[]> {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=12&license_type=commercial`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) return [];
  const { results } = (await res.json()) as { results?: OVResult[] };
  return (results ?? []).filter((r) => USABLE.has((r.license ?? "").toLowerCase()));
}

/** Drop the least specific word and try again — "coins on wooden counter" -> "coins on wooden". */
function broaden(q: string) {
  const parts = q.split(/\s+/);
  return parts.length > 2 ? parts.slice(0, -1).join(" ") : null;
}

async function findPhoto(cue: string, dir: string, id: string): Promise<AssetRef | null> {
  let query: string | null = cue;
  while (query) {
    const results = (await search(query)).sort((a, b) => rank(a) - rank(b));
    for (const r of results.slice(0, 4)) {
      try {
        const out = path.join(dir, `${id}.jpg`);
        await download(r.url, out);
        const lic = `CC ${r.license.toUpperCase()}${r.license_version ? " " + r.license_version : ""} via Openverse`;
        return { segment: id, kind: "photo", file: `${id}.jpg`, source: r.foreign_landing_url ?? r.url, license: lic, credit: r.creator ?? "unknown" };
      } catch {
        continue;  // dead link or too small; try the next result
      }
    }
    query = broaden(query);
    if (query) console.log(`     no usable result, broadening → "${query}"`);
  }
  return null;
}

const slug = slugArg();
const dir = renderDir(slug);
const assetDir = ensure(path.join(dir, "assets"));
const timing = readJson<Segment[]>(path.join(dir, "timing.json"));

console.log(`[4/6] visuals ${slug}  (Openverse, no key)`);
const manifest: AssetRef[] = [];
for (const seg of timing) {
  const asset = await findPhoto(seg.visual_cue, assetDir, seg.id);
  if (asset) {
    console.log(`  ${seg.id.padEnd(8)} ${asset.license}  — ${asset.credit}`);
    manifest.push(asset);
  } else {
    console.warn(`  ${seg.id.padEnd(8)} NOTHING FOUND for "${seg.visual_cue}" — this segment renders bare`);
  }
}
writeJson(path.join(dir, "manifest.json"), manifest);
console.log(`  ${manifest.length}/${timing.length} segments have footage`);
