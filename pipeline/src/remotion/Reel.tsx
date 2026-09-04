import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSansDevanagari";
import type { Props } from "../lib/schema.ts";
import { BeatVisual } from "./components/BeatVisual.tsx";
import { Character3D } from "./components/Character3D.tsx";
import { Captions } from "./components/Captions.tsx";
import { OnScreen } from "./components/OnScreen.tsx";

const { fontFamily } = loadFont();

export const defaultProps: Props = {
  slug: "example",
  language: "hi",
  fps: 30,
  audio: "",
  durationInSeconds: 40,
  segments: [],
  words: [],
};

export const Reel: React.FC<Props & { character?: boolean }> = ({ audio, segments, words, character = false }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", fontFamily }}>
      {segments.map((seg, i) => {
        const from = Math.round(seg.start * fps);
        const duration = Math.max(1, Math.round((seg.end - seg.start) * fps));
        return (
          <Sequence key={seg.id} from={from} durationInFrames={duration}>
            <BeatVisual asset={seg.asset} index={i} />
            <OnScreen text={seg.on_screen} />
          </Sequence>
        );
      })}

      {/* The 3D character sits above the footage and below the captions: real
          backplate, rigged character in front. One instance on the master
          timeline — mounting it per segment would reload the GLB eight times. */}
      {character ? <Character3D segments={segments} words={words} /> : null}

      {/* Captions run on the master timeline so words never reset at a cut. */}
      <Captions words={words} />

      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
