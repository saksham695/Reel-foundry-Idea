/**
 * The zero-key image provider.
 *
 * Every frame is a complete 1080x1920 still. Stage 6 plays them back at a low
 * frame rate — which is the whole point of the image-sequence approach: a talking
 * character is a handful of stills cycled, not generated video. Swap this module
 * for Flux/Gemini output and nothing downstream changes.
 */

export type Expression = "neutral" | "happy" | "shock" | "annoyed" | "sly";

export type Actor = {
  id: string;
  side: "left" | "right";
  skin: string;
  hair: string;
  kurta: string;
  kurtaDark: string;
  moustache: boolean;
};

const W = 1080;
const H = 1920;

/** Deterministic per-character palette, so the same id always looks the same. */
const PALETTES = [
  { skin: "#C98A5E", hair: "#241A16", kurta: "#E07A3F", kurtaDark: "#B85C29", moustache: true },
  { skin: "#D9A175", hair: "#2C2119", kurta: "#4A6FA5", kurtaDark: "#36537D", moustache: false },
  { skin: "#B87A50", hair: "#1E1512", kurta: "#5C8A5C", kurtaDark: "#436743", moustache: true },
];

export function actorFor(id: string, side: "left" | "right", index: number): Actor {
  return { id, side, ...PALETTES[index % PALETTES.length] };
}

function eyes(cx: number, cy: number, expr: Expression, blink: boolean) {
  const dx = 52;
  if (blink) {
    return `
      <path d="M ${cx - dx - 20} ${cy} q 20 12 40 0" stroke="#241A16" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M ${cx + dx - 20} ${cy} q 20 12 40 0" stroke="#241A16" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  }
  const r = expr === "shock" ? 20 : 14;
  const lid = expr === "sly" ? `<rect x="${cx - dx - 24}" y="${cy - 24}" width="${dx * 2 + 48}" height="24" fill="#C98A5E" opacity="0"/>` : "";
  const white = expr === "shock" ? 26 : 20;
  return `
    ${lid}
    <ellipse cx="${cx - dx}" cy="${cy}" rx="${white}" ry="${expr === "sly" ? white * 0.55 : white}" fill="#FFFFFF"/>
    <ellipse cx="${cx + dx}" cy="${cy}" rx="${white}" ry="${expr === "sly" ? white * 0.55 : white}" fill="#FFFFFF"/>
    <circle cx="${cx - dx}" cy="${cy + 2}" r="${r}" fill="#241A16"/>
    <circle cx="${cx + dx}" cy="${cy + 2}" r="${r}" fill="#241A16"/>`;
}

function brows(cx: number, cy: number, expr: Expression) {
  const dx = 52;
  const y = cy - 52;
  const map: Record<Expression, [number, number]> = {
    neutral: [0, 0],
    happy: [-6, -6],
    shock: [-24, -24],
    annoyed: [10, 10],
    sly: [-18, 6],
  };
  const [l, r] = map[expr];
  const tilt = expr === "annoyed" ? 14 : 0;
  return `
    <path d="M ${cx - dx - 30} ${y + l + tilt} q 30 -14 60 ${-tilt}" stroke="#241A16" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path d="M ${cx + dx - 30} ${y + r} q 30 -14 60 ${tilt}" stroke="#241A16" stroke-width="11" fill="none" stroke-linecap="round"/>`;
}

function mouth(cx: number, cy: number, open: number, expr: Expression) {
  const y = cy + 96;
  if (open < 0.08) {
    const curve = expr === "happy" ? 22 : expr === "annoyed" ? -12 : 6;
    return `<path d="M ${cx - 40} ${y} q 40 ${curve} 80 0" stroke="#7A3B2E" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  }
  const rx = expr === "shock" ? 26 : 34 + open * 8;
  const ry = 6 + open * (expr === "shock" ? 34 : 26);
  return `
    <ellipse cx="${cx}" cy="${y + ry * 0.3}" rx="${rx}" ry="${ry}" fill="#5E2A22"/>
    <ellipse cx="${cx}" cy="${y + ry * 0.3 + ry * 0.45}" rx="${rx * 0.6}" ry="${ry * 0.4}" fill="#C4574B"/>`;
}

function person(a: Actor, cx: number, headY: number, expr: Expression, open: number, blink: boolean, bob: number) {
  const y = headY + bob;
  const bodyTop = y + 178;
  return `
  <g>
    <!-- body -->
    <path d="M ${cx - 172} ${H} L ${cx - 156} ${bodyTop + 70} q 14 -80 104 -96 L ${cx + 68} ${bodyTop - 26} q 90 16 104 96 L ${cx + 172} ${H} Z" fill="${a.kurta}"/>
    <path d="M ${cx - 16} ${bodyTop - 12} L ${cx + 16} ${bodyTop - 12} L ${cx + 7} ${H} L ${cx - 7} ${H} Z" fill="${a.kurtaDark}" opacity="0.5"/>
    <!-- neck -->
    <rect x="${cx - 46}" y="${y + 110}" width="92" height="90" rx="28" fill="${a.skin}"/>
    <path d="M ${cx - 46} ${y + 110} h 92 v 26 q -46 22 -92 0 Z" fill="#000" opacity="0.12"/>
    <!-- head -->
    <ellipse cx="${cx}" cy="${y}" rx="152" ry="168" fill="${a.skin}"/>
    <ellipse cx="${cx - 152}" cy="${y + 18}" rx="22" ry="34" fill="${a.skin}"/>
    <ellipse cx="${cx + 152}" cy="${y + 18}" rx="22" ry="34" fill="${a.skin}"/>
    <!-- hair -->
    <path d="M ${cx - 156} ${y - 28} q 10 -152 156 -152 q 146 0 156 152 q -44 -74 -156 -74 q -112 0 -156 74 Z" fill="${a.hair}"/>
    ${brows(cx, y, expr)}
    ${eyes(cx, y, expr, blink)}
    <!-- nose -->
    <path d="M ${cx - 4} ${y + 6} q -18 34 4 42 q 22 -4 14 -22" fill="${a.skin}" stroke="#000" stroke-opacity="0.18" stroke-width="5" stroke-linecap="round"/>
    ${a.moustache ? `<path d="M ${cx - 52} ${y + 56} q 52 -20 104 0 q -52 11 -104 0 Z" fill="${a.hair}"/>` : ""}
    ${mouth(cx, y, open, expr)}
  </g>`;
}

const COUNTER_Y = 1390;
/** Both sets put the characters' feet on the same line, so figures never move. */
const GROUND_Y = COUNTER_Y;

/**
 * Second set: a gali at night, Diwali. Same idiom as the stall — flat shapes, a
 * warm key and a cool ground, and a caption bed at the bottom so text always has
 * something to sit on. `phase` drives the only moving parts: the diya flames and
 * a sparkler burst, so eight frames never look like eight copies.
 */
function street(phase: number) {
  return `
  <defs>
    <linearGradient id="nightsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1B2140"/>
      <stop offset="60%" stop-color="#3A2B4A"/>
      <stop offset="100%" stop-color="#6E4436"/>
    </linearGradient>
    <linearGradient id="bldg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3B2A3A"/>
      <stop offset="100%" stop-color="#241A25"/>
    </linearGradient>
    <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2B2230"/>
      <stop offset="100%" stop-color="#141018"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#nightsky)"/>

  <!-- buildings closing the gali, angled so the street reads as receding -->
  <path d="M 0 120 L 300 300 L 300 ${GROUND_Y} L 0 ${GROUND_Y} Z" fill="url(#bldg)"/>
  <path d="M ${W} 120 L 780 300 L 780 ${GROUND_Y} L ${W} ${GROUND_Y} Z" fill="url(#bldg)"/>
  <rect x="300" y="300" width="480" height="${GROUND_Y - 300}" fill="#2A1F2B"/>

  <!-- lit windows: the cheapest way to say "people live here" -->
  ${[[70,420],[170,560],[62,760],[176,900],[880,430],[980,580],[892,780],[986,930]]
    .map(([x, y], i) => `<rect x="${x}" y="${y}" width="72" height="96" rx="6" fill="#F5C46B" opacity="${0.5 + (i % 3) * 0.16}"/>`).join("")}

  <!-- shuttered shops at the end of the lane -->
  ${[340, 520, 700].map((x) => `
    <rect x="${x}" y="980" width="150" height="${GROUND_Y - 980}" rx="6" fill="#1D1620"/>
    ${Array.from({ length: 7 }, (_, i) => `<rect x="${x + 6}" y="${996 + i * 44}" width="138" height="26" rx="4" fill="#2E2432"/>`).join("")}`).join("")}

  <!-- string of festival lights across the gali -->
  <path d="M 40 268 q 500 176 1000 -36" stroke="#141018" stroke-width="6" fill="none"/>
  ${Array.from({ length: 14 }, (_, i) => {
    const t = i / 13;
    const x = 40 + t * 1000;
    const y = 268 + Math.sin(t * Math.PI) * 132 - t * 36;
    const c = ["#F5C46B", "#E8734D", "#7FC8A9", "#E8A33D"][i % 4];
    return `<circle cx="${x}" cy="${y + 22}" r="26" fill="${c}" opacity="0.16"/><circle cx="${x}" cy="${y + 22}" r="10" fill="${c}"/>`;
  }).join("")}

  <rect y="${GROUND_Y}" width="${W}" height="${H - GROUND_Y}" fill="url(#road)"/>

  <!-- The sparkler sits BEHIND the characters, low and off-centre, so it lights
       them from the back instead of covering their faces. -->
  ${(() => {
    const t = ((phase % 1) + 1) % 1;
    const burst = Math.sin(t * Math.PI) ** 2;
    const cx = 246, cy = GROUND_Y - 210;
    const rays = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const r = 26 + burst * 62;
      return `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(a) * r}" y2="${cy + Math.sin(a) * r}" stroke="#FFF0C2" stroke-width="5" stroke-linecap="round" opacity="${burst * 0.85}"/>`;
    }).join("");
    return `<circle cx="${cx}" cy="${cy}" r="${90 + burst * 130}" fill="#FFE1A0" opacity="${burst * 0.16}"/>${rays}<circle cx="${cx}" cy="${cy}" r="${7 + burst * 9}" fill="#FFFDF4" opacity="${0.35 + burst * 0.6}"/>`;
  })()}`;
}

/** Foreground for the street: diyas along the step, and a sparkler that fires. */
function firecrackers(phase: number) {
  const y = GROUND_Y;
  const t = ((phase % 1) + 1) % 1;

  const diya = (x: number, off: number) => {
    const f = ((t + off) % 1);
    const h = 26 + Math.sin(f * Math.PI * 2) * 7;
    return `
    <ellipse cx="${x}" cy="${y + 92}" rx="40" ry="16" fill="#8A4A32"/>
    <path d="M ${x - 40} ${y + 92} q 40 34 80 0 Z" fill="#6E3826"/>
    <ellipse cx="${x}" cy="${y + 72}" rx="16" ry="${h}" fill="#FFD98A" opacity="0.95"/>
    <ellipse cx="${x}" cy="${y + 78}" rx="9" ry="${h * 0.6}" fill="#FFF3D0"/>
    <circle cx="${x}" cy="${y + 70}" r="${58 + h}" fill="#FFC978" opacity="0.10"/>`;
  };

  return `
  <rect y="${y + 60}" width="${W}" height="${H - y - 60}" fill="#16101A"/>
  ${diya(150, 0)} ${diya(400, 0.3)} ${diya(700, 0.55)} ${diya(950, 0.8)}
  <rect y="${H - 470}" width="${W}" height="470" fill="#120B08" opacity="0.55"/>`;
}


function stall() {
  return `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F5B45E"/>
      <stop offset="100%" stop-color="#D9713F"/>
    </linearGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6B4032"/>
      <stop offset="100%" stop-color="#4A2C23"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2A1B15"/>
      <stop offset="100%" stop-color="#150D0A"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect y="250" width="${W}" height="${COUNTER_Y - 250}" fill="url(#wall)"/>
  ${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 116 + 40}" y="250" width="7" height="${COUNTER_Y - 250}" fill="#2E1B14" opacity="0.35"/>`).join("")}
  <!-- awning -->
  <rect y="150" width="${W}" height="110" fill="#B8402F"/>
  ${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 120 + 4}" y="150" width="58" height="110" fill="#F0E2CE"/>`).join("")}
  <path d="M 0 260 q 60 56 120 0 q 60 56 120 0 q 60 56 120 0 q 60 56 120 0 q 60 56 120 0 q 60 56 120 0 q 60 56 120 0 q 60 56 120 0 q 60 56 120 0 L 1080 260 Z" fill="#B8402F"/>
  <!-- price board: the dead wall space, doing a job -->
  <rect x="694" y="318" width="330" height="228" rx="10" fill="#1E2A22"/>
  <rect x="710" y="334" width="298" height="196" rx="6" fill="#2C3B31"/>
  ${[0, 1, 2].map((i) => `
    <rect x="736" y="${374 + i * 52}" width="150" height="14" rx="7" fill="#EDE3CE" opacity="${0.85 - i * 0.15}"/>
    <rect x="914" y="${374 + i * 52}" width="60" height="14" rx="7" fill="#E8A33D" opacity="${0.85 - i * 0.15}"/>`).join("")}
  <!-- hanging bulb -->
  <line x1="${W / 2}" y1="260" x2="${W / 2}" y2="392" stroke="#1A100C" stroke-width="7"/>
  <circle cx="${W / 2}" cy="424" r="120" fill="#FFE9A8" opacity="0.13"/>
  <circle cx="${W / 2}" cy="424" r="36" fill="#FFE9A8"/>
  <!-- floor -->
  <rect y="${COUNTER_Y}" width="${W}" height="${H - COUNTER_Y}" fill="url(#floor)"/>`;
}

function counter(phase: number) {
  const y = COUNTER_Y;
  const puff = (x: number, p: number) => {
    const t = ((p % 1) + 1) % 1;
    return `<ellipse cx="${x + Math.sin(t * Math.PI * 2) * 18}" cy="${y - 170 - t * 240}" rx="${24 + t * 34}" ry="${28 + t * 38}" fill="#FFF8EC" opacity="${(1 - t) * 0.55}"/>`;
  };
  return `
  ${puff(86, phase)}
  ${puff(112, phase + 0.34)}
  ${puff(70, phase + 0.68)}
  <!-- kettle, hard left so it never crosses a face -->
  <ellipse cx="92" cy="${y - 56}" rx="72" ry="60" fill="#B9BEC4"/>
  <ellipse cx="92" cy="${y - 88}" rx="50" ry="19" fill="#CFD4D9"/>
  <rect x="72" y="${y - 126}" width="40" height="26" rx="9" fill="#8E949B"/>
  <path d="M 158 ${y - 82} q 46 -24 34 -72" stroke="#B9BEC4" stroke-width="20" fill="none" stroke-linecap="round"/>
  <!-- glasses, hard right -->
  ${[890, 966, 1042].map((x) => `
    <path d="M ${x - 24} ${y - 74} L ${x + 24} ${y - 74} L ${x + 17} ${y - 2} L ${x - 17} ${y - 2} Z" fill="#E8A33D"/>
    <path d="M ${x - 26} ${y - 76} L ${x + 26} ${y - 76} L ${x + 24} ${y - 64} L ${x - 24} ${y - 64} Z" fill="#F6D9A0"/>`).join("")}
  <!-- counter: top edge, then a solid front all the way down -->
  <rect x="0" y="${y}" width="${W}" height="54" fill="#B87B46"/>
  <rect x="0" y="${y + 54}" width="${W}" height="${H - y - 54}" fill="#7A4F2C"/>
  <rect x="0" y="${y + 54}" width="${W}" height="22" fill="#000" opacity="0.22"/>
  ${[0, 1, 2, 3].map((i) => `<rect x="${i * 270 + 8}" y="${y + 96}" width="254" height="${H - y - 140}" rx="8" fill="#000" opacity="0.10"/>`).join("")}
  <!-- caption bed -->
  <rect y="${H - 470}" width="${W}" height="470" fill="#120B08" opacity="0.55"/>`;
}

/**
 * One frame of a two-hander.
 * `open` is mouth aperture 0..1 for the speaking character; everything else is dressing.
 */
export function sceneFrame(opts: {
  actors: Actor[];
  speaking: string;
  expression: Expression;
  open: number;
  blink: boolean;
  phase: number;
  set?: "stall" | "street";
}): string {
  const { actors, speaking, expression, open, blink, phase, set = "stall" } = opts;
  const bob = Math.sin(phase * Math.PI * 2) * 6;

  const placed = actors.map((a) => {
    const cx = a.side === "left" ? 326 : 796;
    const isSpeaking = a.id === speaking;
    const body = person(
      a,
      cx,
      840,
      isSpeaking ? expression : "neutral",
      isSpeaking ? open : 0,
      isSpeaking ? false : blink,
      isSpeaking ? bob : 0,
    );
    // The listener drops back so the eye goes to whoever is talking.
    return isSpeaking ? body : `<g style="filter: brightness(0.68) saturate(0.8)">${body}</g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${set === "street" ? street(phase) : stall()}
${placed.join("\n")}
${set === "street" ? firecrackers(phase) : counter(phase)}
</svg>`;
}
