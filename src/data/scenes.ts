// Frame-accurate scene timeline for "How Does Code Become Electricity?"
// 30 fps, 1800 frames total (60s). Scenes are arranged with <TransitionSeries>,
// so order (not an explicit `from`) determines placement in the timeline.

export type SceneId =
  | "hook"
  | "code"
  | "binary"
  | "transistors"
  | "calculation"
  | "reveal"
  | "cta";

export interface SceneDefinition {
  id: SceneId;
  label: string;
  // The sequence's own on-screen duration, INCLUDING the extra frames that
  // get eaten by the transition into the next scene (see TRANSITION_FRAMES).
  durationInFrames: number;
}

const FPS = 30;
const seconds = (s: number) => s * FPS;

export const VIDEO_FPS = FPS;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_DURATION_IN_FRAMES = seconds(60);

// Each cut between scenes uses a crossfade/wipe transition of this length.
// TransitionSeries overlaps adjacent sequences by this many frames, so every
// non-final scene's durationInFrames below is padded by this amount to keep
// the final rendered total at exactly VIDEO_DURATION_IN_FRAMES.
export const TRANSITION_FRAMES = 15;

// Base (pre-padding) durations matching each scene's internal animation
// timeline. Padding is applied in SCENES below.
const BASE_DURATIONS: Record<SceneId, number> = {
  hook: seconds(3),
  code: seconds(7),
  binary: seconds(10),
  transistors: seconds(12),
  calculation: seconds(12),
  reveal: seconds(10),
  cta: seconds(6),
};

const SCENE_ORDER: SceneId[] = [
  "hook",
  "code",
  "binary",
  "transistors",
  "calculation",
  "reveal",
  "cta",
];

export const SCENES: SceneDefinition[] = SCENE_ORDER.map((id, index) => {
  const isLast = index === SCENE_ORDER.length - 1;
  const labels: Record<SceneId, string> = {
    hook: "Hook",
    code: "Code mystery",
    binary: "Binary transformation",
    transistors: "Transistors & chip zoom",
    calculation: "Logic gates & calculation",
    reveal: "Result reveal (2 + 3 = 5)",
    cta: "Call to action",
  };
  const label = labels[id];

  return {
    id,
    label,
    durationInFrames: BASE_DURATIONS[id] + (isLast ? 0 : TRANSITION_FRAMES),
  };
});

export const getScene = (id: SceneId): SceneDefinition => {
  const scene = SCENES.find((s) => s.id === id);
  if (!scene) {
    throw new Error(`Unknown scene id: ${id}`);
  }
  return scene;
};
