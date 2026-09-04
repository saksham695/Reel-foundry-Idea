import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

/** Who is speaking. Small, warm, on the speaker's side of frame. */
export const NameTag: React.FC<{ name: string; side: "left" | "right" }> = ({ name, side }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: side === "left" ? "flex-start" : "flex-end",
        padding: "0 80px 470px",
      }}
    >
      <div
        style={{
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [14, 0])}px)`,
          backgroundColor: "rgba(20,12,9,0.72)",
          color: "#FFD84D",
          fontSize: 38,
          fontWeight: 700,
          padding: "12px 28px",
          borderRadius: 999,
        }}
      >
        {name}
      </div>
    </AbsoluteFill>
  );
};
