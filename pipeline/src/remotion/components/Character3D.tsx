import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { AnimationMixer, Box3, MathUtils, Mesh, Object3D, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Word } from "../../lib/schema.ts";

/**
 * A real 3D character on the timeline.
 *
 * Remotion renders through headless Chrome, so @remotion/three puts an actual WebGL
 * scene on the same timeline as the footage. That matters commercially: a rigged
 * character costs nothing per frame and is byte-identical across a thousand episodes.
 * No LoRA drift, no per-clip generation bill, and the camera, lighting and set can
 * change without regenerating anything.
 *
 * The one rule that makes this work in a renderer: NOTHING may advance on wall-clock
 * time. Remotion renders frames out of order and in parallel, so the mixer is driven
 * by `frame / fps` via setTime(), never by a delta in useFrame().
 */

type Emotion = "neutral" | "warm" | "wry" | "concerned" | "urgent" | "amused" | "resigned";

/** World height the character is normalised to, and where its centre sits. With the
 *  camera below, this puts it in the lower two-thirds and leaves the top of frame
 *  for the footage and the on-screen line. */
const TARGET_HEIGHT = 1.75;
const GROUND_Y = -0.55;

/** Emotion decides how the body carries the line. Kept calm — a reel is 24 seconds. */
const CLIP: Record<Emotion, string> = {
  neutral: "Idle", warm: "Idle", wry: "Idle", concerned: "Idle",
  urgent: "Yes", amused: "Wave", resigned: "Idle",
};
/** The model ships three morph targets. Anything not listed just stays neutral. */
const MORPH: Partial<Record<Emotion, { name: string; weight: number }>> = {
  wry: { name: "Sad", weight: 0.28 },
  concerned: { name: "Sad", weight: 0.55 },
  resigned: { name: "Sad", weight: 0.7 },
  urgent: { name: "Surprised", weight: 0.4 },
  amused: { name: "Surprised", weight: 0.25 },
};

const Rig: React.FC<{ gltf: GLTF; clip: string; emotion: Emotion; speaking: number }> = ({
  gltf, clip, emotion, speaking,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const mixer = useMemo(() => new AnimationMixer(gltf.scene), [gltf]);

  // Swap the clip when the segment's emotion changes, then scrub deterministically.
  useEffect(() => {
    mixer.stopAllAction();
    const found = gltf.animations.find((a) => a.name === clip) ?? gltf.animations[0];
    if (found) mixer.clipAction(found).play();
  }, [mixer, gltf, clip]);

  useEffect(() => { mixer.setTime(t); }, [mixer, t]);

  // Head bone: a small nod on every spoken word. The model has no visemes, so this
  // is what reads as speech at phone scale — motion tied to the caption timing.
  const head = useMemo(() => {
    let h: Object3D | null = null;
    gltf.scene.traverse((o) => { if (!h && o.name === "Head") h = o; });
    return h as Object3D | null;
  }, [gltf]);

  useEffect(() => {
    if (head) {
      head.rotation.x = Math.sin(t * 15) * 0.07 * speaking;
      head.rotation.y = Math.sin(t * 5.5) * 0.05;
    }
    const m = MORPH[emotion];
    gltf.scene.traverse((o) => {
      const mesh = o as Mesh;
      const dict = (mesh as unknown as { morphTargetDictionary?: Record<string, number> }).morphTargetDictionary;
      const infl = (mesh as unknown as { morphTargetInfluences?: number[] }).morphTargetInfluences;
      if (!dict || !infl) return;
      for (const k of Object.keys(dict)) infl[dict[k]] = 0;
      if (m && dict[m.name] !== undefined) infl[dict[m.name]] = m.weight;
      // Mouth is faked through "Surprised" pulsing with the speech envelope.
      if (dict.Surprised !== undefined) {
        infl[dict.Surprised] = Math.max(infl[dict.Surprised], Math.abs(Math.sin(t * 17)) * 0.35 * speaking);
      }
    });
  }, [head, t, speaking, emotion, gltf]);

  // Auto-frame. FBX2GLTF leaves a large node scale on this model and the accessor
  // bounds are bind-pose only, so the only honest measurement is the real world
  // box after load. Normalise to a fixed height and the camera never needs tuning
  // again — swap the character and the framing still holds.
  const fit = useMemo(() => {
    const box = new Box3().setFromObject(gltf.scene);
    const size = new Vector3();
    const centre = new Vector3();
    box.getSize(size);
    box.getCenter(centre);
    const scale = TARGET_HEIGHT / (size.y || 1);
    return { scale, centre };
  }, [gltf]);

  // Breathing idle sway so the character never sits perfectly still.
  const sway = Math.sin(t * 1.1) * 0.04;

  return (
    <group position={[0, GROUND_Y, 0]} rotation={[0, sway + 0.15, 0]} scale={fit.scale}>
      {/* Re-centre on the measured box so the model's own origin is irrelevant. */}
      <group position={[-fit.centre.x, -fit.centre.y, -fit.centre.z]}>
        <primitive object={gltf.scene} />
      </group>
    </group>
  );
};

type Seg = { start: number; end: number; direction?: { emotion: Emotion } };

export const Character3D: React.FC<{
  segments: Seg[];
  words: Word[];
}> = ({ segments, words }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const [gltf, setGltf] = useState<GLTF | null>(null);
  const [handle] = useState(() => delayRender("loading 3D character"));

  useEffect(() => {
    new GLTFLoader().load(
      staticFile("characters/RobotExpressive.glb"),
      (g) => { setGltf(g); continueRender(handle); },
      undefined,
      (e) => cancelRender(e as Error),
    );
  }, [handle]);

  // 1 while a caption word is on screen, eased so the mouth does not snap shut.
  const t = frame / fps;

  // One instance on the master timeline, so the emotion is read from whichever
  // segment is live rather than from a per-Sequence prop.
  const emotion: Emotion =
    segments.find((s) => t >= s.start && t < s.end)?.direction?.emotion ?? "neutral";
  const speaking = useMemo(() => {
    const live = words.some((w) => t >= w.start - 0.04 && t <= w.end + 0.04);
    return live ? 1 : 0;
  }, [words, t]);
  const [smooth, setSmooth] = useState(0);
  useEffect(() => { setSmooth((s) => MathUtils.lerp(s, speaking, 0.45)); }, [speaking]);

  if (!gltf) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 34, position: [0, 0.1, 6.2] }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        {/* Warm key from the dashboard side, cool rim from the street. The two-source
            lighting is what stops a 3D render reading as a video-game screenshot. */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 4, 4]} intensity={2.1} color="#ffcf94" />
        <directionalLight position={[-4, 2, -2]} intensity={1.3} color="#79b8d1" />
        <pointLight position={[0, -1, 2.5]} intensity={1.1} color="#e8a33d" />
        <Rig gltf={gltf} clip={CLIP[emotion]} emotion={emotion} speaking={smooth} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
