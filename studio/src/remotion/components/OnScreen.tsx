import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/** The short overlay line per beat — the thing someone reads with the sound off. */
export const OnScreen: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  if (!text) return null;

  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 12 });
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", padding: "330px 90px 0" }}>
      <div
        style={{
          opacity: enter * exit,
          transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px)`,
          fontSize: 66,
          fontWeight: 800,
          color: "#FFD84D",
          textAlign: "center",
          lineHeight: 1.2,
          textShadow: "0 4px 20px rgba(0,0,0,0.8)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
