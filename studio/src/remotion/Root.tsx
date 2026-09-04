import { Composition } from "remotion";
import { Reel, defaultProps } from "./Reel.tsx";
import type { Props } from "../lib/schema.ts";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={1200}
    defaultProps={defaultProps}
    // Duration comes from the narration, not a guess.
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.round((props.durationInSeconds || 40) * (props.fps || 30)),
      fps: props.fps || 30,
    })}
  />
);
