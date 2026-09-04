/** All six stages, in order. `npm run make -- <slug>` */
import { spawnSync } from "node:child_process";
import { ROOT, slugArg } from "./lib/paths.ts";

const slug = slugArg();
for (const stage of ["1-script", "2-voice", "3-captions", "4-visuals", "5-props", "6-render"]) {
  const r = spawnSync("npx", ["tsx", `src/${stage}.ts`, slug], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) {
    console.error(`\nstopped at ${stage}`);
    process.exit(r.status ?? 1);
  }
}
