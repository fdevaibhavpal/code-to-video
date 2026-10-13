import { interpolate, useCurrentFrame } from "remotion";

interface SceneTransitionProps {
  children: React.ReactNode;
  durationInFrames: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
}

// Wraps a scene with a deterministic fade-in / fade-out based purely on the
// local frame, so every scene can be composed inside a Sequence without
// worrying about hard cuts.
export const SceneTransition: React.FC<SceneTransitionProps> = ({
  children,
  durationInFrames,
  fadeInFrames = 12,
  fadeOutFrames = 12,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, fadeInFrames, durationInFrames - fadeOutFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity,
      }}
    >
      {children}
    </div>
  );
};
