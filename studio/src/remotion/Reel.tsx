import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSansDevanagari";
import type { Props } from "../lib/schema.ts";
import { ImageSequence } from "./components/ImageSequence.tsx";
import { Captions } from "./components/Captions.tsx";
import { OnScreen } from "./components/OnScreen.tsx";
import { NameTag } from "./components/NameTag.tsx";

const { fontFamily } = loadFont();

export const defaultProps: Props = {
  slug: "example",
  language: "hi",
  fps: 30,
  audio: "",
  durationInSeconds: 40,
  background: null,
  characters: [],
  lines: [],
  words: [],
  envelope: [],
};

export const Reel: React.FC<Props> = ({ audio, lines, words, characters, envelope }) => {
  const { fps } = useVideoConfig();
  const cast = new Map(characters.map((c) => [c.id, c]));

  return (
    <AbsoluteFill style={{ backgroundColor: "#140C09", fontFamily }}>
      {lines.map((line) => {
        const from = Math.round(line.start * fps);
        const duration = Math.max(1, Math.round((line.end - line.start) * fps));
        return (
          <Sequence key={line.id} from={from} durationInFrames={duration} name={line.id}>
            <ImageSequence shot={line.shot} envelope={envelope} startFrame={from} />
            <NameTag
              name={cast.get(line.speaker)?.name ?? line.speaker}
              side={cast.get(line.speaker)?.side ?? "left"}
            />
            <OnScreen text={line.on_screen} />
          </Sequence>
        );
      })}

      {/* Captions run on the master timeline so words never reset at a cut. */}
      <Captions words={words} />

      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
