import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { uiSwitch, whoosh } from "@remotion/sfx";
import { BinaryStream } from "../components/BinaryStream";
import { Captions } from "../components/Caption";
import { TransitionSfx } from "../components/TransitionSfx";
import { getSceneNarration } from "../data/useNarration";

interface Scene03BinaryProps {
  voiceId: string;
}

// Local timeline (300 frames @ 30fps = 10s, scene starts at 10s global):
// 0-30    : "2" and "3" fade in above their binary rows
// 30-120  : binary rows reveal digit-by-digit (00000010 and 00000011)
// 120-150 : hold, both rows fully lit
// 150-210 : rows slide together toward center, converging
// 210-240 : converged stream compresses into a bright point (chip seed)
// 240-300 : hold on the point, fading out to next scene
const LABEL_IN_END = 30;
const REVEAL_START = 30;
const REVEAL_END = 120;
const CONVERGE_START = 150;
const CONVERGE_END = 210;
const COMPRESS_START = 210;
const COMPRESS_END = 240;

const BITS_2 = "00000010";
const BITS_3 = "00000011";

export const Scene03Binary: React.FC<Scene03BinaryProps> = ({ voiceId }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const narration = getSceneNarration(voiceId, "binary");

  const labelOpacity = interpolate(frame, [0, LABEL_IN_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const revealProgress = interpolate(
    frame,
    [REVEAL_START, REVEAL_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const convergeProgress = interpolate(
    frame,
    [CONVERGE_START, CONVERGE_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const rowOffset = interpolate(convergeProgress, [0, 1], [0, 120]);

  const compressProgress = interpolate(
    frame,
    [COMPRESS_START, COMPRESS_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const compressScale = interpolate(compressProgress, [0, 1], [1, 0.03]);
  const rowsOpacity = interpolate(compressProgress, [0, 0.8, 1], [1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pointOpacity = interpolate(compressProgress, [0.6, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 56,
          transform: `scale(${compressScale})`,
          opacity: rowsOpacity,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            transform: `translateY(${rowOffset}px)`,
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 40,
              fontWeight: 700,
              color: "#F97316",
              opacity: labelOpacity,
            }}
          >
            2
          </div>
          <BinaryStream progress={revealProgress} bits={BITS_2} fontSize={48} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            transform: `translateY(${-rowOffset}px)`,
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 40,
              fontWeight: 700,
              color: "#F97316",
              opacity: labelOpacity,
            }}
          >
            3
          </div>
          <BinaryStream progress={revealProgress} bits={BITS_3} fontSize={48} />
        </div>
      </div>

      {/* Bright convergence point */}
      <div
        style={{
          position: "absolute",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#EAFEFF",
          boxShadow: "0 0 40px 20px rgba(34,211,238,0.6)",
          opacity: pointOpacity,
        }}
      />

      {narration.audioSrc && <Audio src={narration.audioSrc} premountFor={fps} />}
      <Captions captions={narration.captions} />
      <TransitionSfx triggerAtFrame={COMPRESS_END} src={uiSwitch} volume={0.2} />
      <TransitionSfx triggerAtFrame={300} src={whoosh} />
    </div>
  );
};
