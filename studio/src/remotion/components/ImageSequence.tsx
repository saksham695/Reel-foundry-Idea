import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Shot } from "../../lib/schema.ts";

/**
 * Stills selected by the narration's loudness — the substitute for generated video.
 *
 * `shot.frames` is a mouth-aperture ladder (closed → wide). We index it with the
 * envelope value at this instant, so the mouth tracks the voice. With no envelope
 * (a stock slideshow, say) it falls back to cycling at `shot.fps`.
 */
export const ImageSequence: React.FC<{ shot: Shot | null; envelope: number[]; startFrame: number }> = ({
  shot,
  envelope,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!shot || shot.frames.length === 0) return <AbsoluteFill style={{ backgroundColor: "#140C09" }} />;

  const absolute = startFrame + frame;
  const level = envelope[absolute];
  const index =
    level === undefined
      ? Math.floor((frame / fps) * shot.fps) % shot.frames.length
      : Math.min(shot.frames.length - 1, Math.round(level * (shot.frames.length - 1)));

  // A slow breath, so a held mouth pose is never a frozen picture.
  const bob = Math.sin((absolute / fps) * 1.6) * 5;

  return (
    <AbsoluteFill style={{ backgroundColor: "#140C09" }}>
      <Img
        src={staticFile(shot.frames[index])}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `translateY(${bob}px) scale(1.01)` }}
      />
    </AbsoluteFill>
  );
};
