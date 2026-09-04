import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Word } from "../../lib/schema.ts";

const WINDOW = 4; // words visible at once

/**
 * Karaoke captions: a short rolling window with the spoken word highlighted.
 * Sits in the lower third, inside the safe area both apps overlay their UI on.
 */
export const Captions: React.FC<{ words: Word[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  let index = words.findIndex((w) => t >= w.start && t < w.end);
  if (index === -1) {
    // Between words: hold on the last one that has started.
    for (let i = words.length - 1; i >= 0; i--) {
      if (t >= words[i].start) {
        index = i;
        break;
      }
    }
  }
  if (index === -1) return null;

  const group = Math.floor(index / WINDOW);
  const visible = words.slice(group * WINDOW, group * WINDOW + WINDOW);

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", padding: "0 90px 380px" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 18px",
          fontSize: 78,
          fontWeight: 800,
          lineHeight: 1.25,
          textAlign: "center",
          textShadow: "0 6px 24px rgba(0,0,0,0.85)",
        }}
      >
        {visible.map((w, i) => {
          const active = group * WINDOW + i === index;
          return (
            <span key={`${w.start}-${i}`} style={{ color: active ? "#FFD84D" : "#ffffff" }}>
              {w.word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
