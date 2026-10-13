import { Audio } from "@remotion/media";
import { Sequence, useVideoConfig } from "remotion";

interface TransitionSfxProps {
  /** Local frame (within the current scene) when the transition into the
   * next scene begins — i.e. scene durationInFrames minus TRANSITION_FRAMES. */
  triggerAtFrame: number;
  /** Remote SFX URL, e.g. from @remotion/sfx (whoosh, uiSwitch, ding, whip). */
  src: string;
  volume?: number;
  durationInFrames?: number;
}

// Plays a short sound effect starting at a specific local frame, wrapped in
// its own Sequence so Remotion mounts/unmounts it cleanly instead of
// re-triggering on every render. Kept well under narration volume by
// default (0.18) so it reads as texture, not a competing sound.
export const TransitionSfx: React.FC<TransitionSfxProps> = ({
  triggerAtFrame,
  src,
  volume = 0.18,
  durationInFrames,
}) => {
  const { fps } = useVideoConfig();

  return (
    <Sequence
      from={triggerAtFrame}
      durationInFrames={durationInFrames ?? Math.round(fps * 1.2)}
      layout="none"
    >
      <Audio src={src} volume={volume} />
    </Sequence>
  );
};
