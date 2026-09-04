import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import type { AssetRef } from "../../lib/schema.ts";

/**
 * One visual per segment.
 *
 * The first version pushed every still from 1.06 to 1.16, linearly, in the same
 * direction, for its whole duration. Eight segments of identical mechanical zoom
 * is what makes a stock-footage reel read as flat — the eye reads "slideshow",
 * not "camera". Three things fix that without any new asset:
 *
 *   1. Vary the move per segment. Direction, origin and amount are derived from
 *      the segment index, so it is deterministic but never twice the same.
 *   2. Ease it. A real camera accelerates and settles; linear interpolation is
 *      the giveaway.
 *   3. Give it depth. A slight perspective rotation plus a foreground layer that
 *      drifts against the background is parallax — the cheapest depth cue there
 *      is, and the difference between "photo" and "shot".
 */

type Move = { fromScale: number; toScale: number; fromX: number; toX: number; fromY: number; toY: number; rotate: number; origin: string };

/** Six camera moves, picked by index. Enough that a 6-8 segment reel never repeats. */
const MOVES: Move[] = [
  { fromScale: 1.04, toScale: 1.18, fromX:  0, toX:  0, fromY:  2, toY: -3, rotate:  0.6, origin: "50% 40%" }, // push in, drift up
  { fromScale: 1.20, toScale: 1.05, fromX: -3, toX:  1, fromY:  0, toY:  0, rotate: -0.5, origin: "40% 50%" }, // pull out, settle right
  { fromScale: 1.10, toScale: 1.16, fromX:  4, toX: -4, fromY:  0, toY:  0, rotate:  0.4, origin: "60% 50%" }, // lateral pan
  { fromScale: 1.06, toScale: 1.20, fromX: -2, toX:  2, fromY: -2, toY:  2, rotate: -0.7, origin: "45% 60%" }, // push in, diagonal
  { fromScale: 1.22, toScale: 1.08, fromX:  0, toX:  0, fromY: -4, toY:  2, rotate:  0.5, origin: "50% 55%" }, // pull out, tilt down
  { fromScale: 1.08, toScale: 1.15, fromX:  2, toX: -2, fromY:  3, toY: -1, rotate: -0.4, origin: "55% 45%" }, // slow drift
];

export const BeatVisual: React.FC<{ asset: AssetRef | null; index?: number }> = ({ asset, index = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  if (!asset) return <AbsoluteFill style={{ backgroundColor: "#111" }} />;

  const m = MOVES[index % MOVES.length];
  // Ease out: quick at the top of the shot, settling by the end, like a real move.
  const t = (from: number, to: number) =>
    interpolate(frame, [0, durationInFrames], [from, to], {
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 0.61, 0.36, 1),
    });

  const scale = t(m.fromScale, m.toScale);
  const x = t(m.fromX, m.toX);
  const y = t(m.fromY, m.toY);
  const rot = t(m.rotate, -m.rotate * 0.3);

  // Both plates must be absolutely positioned: two block-level <Img> at 100%
  // height stack in normal flow, which pushes the sharp layer a whole frame down.
  const fill: React.CSSProperties = {
    position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
  };
  const layer: React.CSSProperties = {
    ...fill,
    transformOrigin: m.origin,
    transform: `perspective(1400px) rotateY(${rot}deg) scale(${scale}) translate(${x}%, ${y}%)`,
  };

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      {asset.kind === "video" ? (
        <OffthreadVideo src={staticFile(asset.file)} muted style={{ ...fill, transform: `scale(1.06)` }} />
      ) : (
        <>
          {/* Background plate: blurred, larger, moving slightly against the sharp
              layer. Two planes at different speeds is what the eye reads as depth,
              and it also fills the frame when a source image is not 9:16. */}
          <Img
            src={staticFile(asset.file)}
            style={{
              ...fill,
              filter: "blur(28px) saturate(1.15) brightness(0.55)",
              transform: `scale(${scale * 1.25}) translate(${-x * 0.5}%, ${-y * 0.5}%)`,
            }}
          />
          <Img src={staticFile(asset.file)} style={layer} />
        </>
      )}

      {/* Vignette — pulls the eye to centre and stops the edges feeling like a slide. */}
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)" }}
      />
      {/* Bottom scrim so captions stay legible over any footage. */}
      <AbsoluteFill
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.82) 100%)" }}
      />
    </AbsoluteFill>
  );
};
