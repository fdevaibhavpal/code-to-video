import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { getSceneNarration } from "../data/useNarration";

interface Scene07CTAProps {
  voiceId: string;
}

// Local timeline (180 frames @ 30fps = 6s, scene starts at 54s global):
// 0-25   : logo mark + title fade/scale in
// 25-55  : "Follow for more" line fades in below
// 55-150 : gentle looping pulse on the follow line (deterministic sine)
// 150-180: fade to black (end of video)
const TITLE_IN_END = 25;
const FOLLOW_IN_START = 25;
const FOLLOW_IN_END = 55;
const FADE_START = 150;
const FADE_END = 180;

export const Scene07CTA: React.FC<Scene07CTAProps> = ({ voiceId }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const narration = getSceneNarration(voiceId, "cta");

  const titleOpacity = interpolate(frame, [0, TITLE_IN_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleScale = interpolate(frame, [0, TITLE_IN_END], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const followOpacity = interpolate(
    frame,
    [FOLLOW_IN_START, FOLLOW_IN_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Deterministic gentle pulse (sine wave), not random.
  const pulse = 0.5 + 0.5 * Math.sin(frame / 15);

  const sceneFade = interpolate(frame, [FADE_START, FADE_END], [1, 0], {
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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        overflow: "hidden",
        opacity: sceneFade,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            border: "3px solid #22D3EE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 30px rgba(34,211,238,0.5)",
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 40,
              fontWeight: 700,
              color: "#22D3EE",
            }}
          >
            ⚡
          </span>
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
            fontSize: 40,
            fontWeight: 700,
            color: "#E8FBFF",
            textAlign: "center",
            maxWidth: 800,
            textShadow: "0 0 20px rgba(34,211,238,0.4)",
          }}
        >
          Code Become Electricity
        </div>
      </div>

      <div
        style={{
          fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
          fontSize: 48,
          fontWeight: 700,
          color: "#A78BFA",
          opacity: followOpacity,
          textShadow: `0 0 ${20 + 15 * pulse}px rgba(167,139,250,${
            0.5 + 0.3 * pulse
          })`,
        }}
      >
        Follow for more
      </div>

      {narration.audioSrc && <Audio src={narration.audioSrc} premountFor={fps} />}
    </div>
  );
};
