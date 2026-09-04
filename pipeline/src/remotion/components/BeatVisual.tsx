import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { AssetRef } from "../../lib/schema.ts";

/**
 * One visual per segment. Stills get a slow push so nothing sits dead on screen;
 * video plays muted and is cropped to fill 1080x1920.
 */
export const BeatVisual: React.FC<{ asset: AssetRef | null }> = ({ asset }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1.06, 1.16], { extrapolateRight: "clamp" });

  if (!asset) return <AbsoluteFill style={{ backgroundColor: "#111" }} />;

  const fill: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      {asset.kind === "video" ? (
        <OffthreadVideo src={staticFile(asset.file)} muted style={{ ...fill, transform: `scale(1.04)` }} />
      ) : (
        <Img src={staticFile(asset.file)} style={{ ...fill, transform: `scale(${scale})` }} />
      )}
      {/* Bottom scrim so captions stay legible over any footage. */}
      <AbsoluteFill
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.8) 100%)" }}
      />
    </AbsoluteFill>
  );
};
