import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** Stage outputs live under public/ so Remotion's staticFile() can reach them. */
export const renderDir = (slug: string) => path.join(ROOT, "public", "renders", slug);
/** The same path as Remotion sees it. */
export const staticPath = (slug: string, ...rest: string[]) => ["renders", slug, ...rest].join("/");

export function ensure(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

export function writeJson(file: string, data: unknown) {
  ensure(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`  → ${path.relative(ROOT, file)}`);
}

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set. Copy .env.example to .env and fill it in.`);
  return v;
}

/** The slug is argv[2] everywhere. */
export function slugArg(): string {
  const s = process.argv[2];
  if (!s) throw new Error("Usage: npm run <stage> -- <slug>");
  return s;
}
