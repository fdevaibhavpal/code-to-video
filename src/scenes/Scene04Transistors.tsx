import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { uiSwitch, whoosh } from "@remotion/sfx";
import { Chip } from "../components/Chip";
import { Transistor } from "../components/Transistor";
import { Captions } from "../components/Caption";
import { TransitionSfx } from "../components/TransitionSfx";
import { getSceneNarration } from "../data/useNarration";

interface Scene04TransistorsProps {
  voiceId: string;
}

// Local timeline (360 frames @ 30fps = 12s, scene starts at 20s global):
// 0-40    : zoom into the chip from a small point
// 40-70   : chip settles, pins visible
// 70-100  : zoom further into the chip surface, revealing a transistor grid
// 100-280 : transistors switch on in a deterministic wave pattern
// 280-375 : hold, grid fully lit (handoff to the next scene's transition)
const ZOOM_IN_END = 40;
const SETTLE_END = 70;
const SURFACE_ZOOM_END = 100;
const SWITCH_START = 100;
const SWITCH_END = 280;

const GRID_COLS = 5;
const GRID_ROWS = 6;
const TRANSISTOR_COUNT = GRID_COLS * GRID_ROWS;

export const Scene04Transistors: React.FC<Scene04TransistorsProps> = ({
  voiceId,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const narration = getSceneNarration(voiceId, "transistors");

  const chipScale = interpolate(frame, [0, ZOOM_IN_END], [0.15, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chipOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const surfaceZoomProgress = interpolate(
    frame,
    [SETTLE_END, SURFACE_ZOOM_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const chipFadeOutForSurface = interpolate(surfaceZoomProgress, [0, 1], [1, 0]);
  const gridScale = interpolate(surfaceZoomProgress, [0, 1], [0.3, 1]);
  const gridOpacity = interpolate(surfaceZoomProgress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        background: "#050608",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Chip, zooms in then fades as we move into the surface */}
      <div
        style={{
          position: "absolute",
          transform: `scale(${chipScale})`,
          opacity: chipOpacity * chipFadeOutForSurface,
        }}
      >
        <Chip size={360} glowIntensity={0.7} />
      </div>

      {/* Transistor grid, revealed as we "zoom into" the chip surface */}
      <div
        style={{
          position: "absolute",
          transform: `scale(${gridScale})`,
          opacity: gridOpacity,
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gap: 28,
        }}
      >
        {Array.from({ length: TRANSISTOR_COUNT }, (_, i) => {
          const col = i % GRID_COLS;
          const row = Math.floor(i / GRID_COLS);
          // Deterministic diagonal wave: transistors switch on in order of
          // (row + col), creating a sweeping on-pattern across the grid.
          const wave = row + col;
          const maxWave = GRID_ROWS + GRID_COLS - 2;
          const waveStart =
            SWITCH_START + (wave / maxWave) * (SWITCH_END - SWITCH_START - 40);
          const waveEnd = waveStart + 40;

          const state = interpolate(frame, [waveStart, waveEnd], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return <Transistor key={i} size={64} state={state} />;
        })}
      </div>

      {narration.audioSrc && <Audio src={narration.audioSrc} premountFor={fps} />}
      <Captions captions={narration.captions} />
      <TransitionSfx triggerAtFrame={SURFACE_ZOOM_END} src={uiSwitch} volume={0.18} />
      <TransitionSfx triggerAtFrame={360} src={whoosh} />
    </div>
  );
};
