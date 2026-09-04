import fs from "node:fs";
import { actorFor, sceneFrame } from "./lib/vectorArt.ts";
const actors = [actorFor("ramesh", "left", 0), actorFor("sunil", "right", 1)];
fs.writeFileSync("/tmp/frame-a.svg", sceneFrame({ actors, speaking: "ramesh", expression: "sly", open: 0.85, blink: false, phase: 0.2 }));
fs.writeFileSync("/tmp/frame-b.svg", sceneFrame({ actors, speaking: "sunil", expression: "shock", open: 0.4, blink: false, phase: 0.6 }));
console.log("written");
