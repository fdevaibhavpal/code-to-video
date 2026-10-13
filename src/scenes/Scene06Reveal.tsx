import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { useGsapTimeline } from "@remotion/gsap";
import { ding, whoosh } from "@remotion/sfx";
import { Captions } from "../components/Caption";
import { TransitionSfx } from "../components/TransitionSfx";
import { getSceneNarration } from "../data/useNarration";

interface Scene06RevealProps {
  voiceId: string;
}

// Local timeline (300 frames @ 30fps = 10s, scene starts at 44s global):
// 0-20    : point expands into "2 + 3 ="
// 20-50   : hold on the equation
// 50-80   : "5" snaps in with a scale-bounce (deterministic overshoot)
// 80-110  : full glow pulse around the result
// 110-220 : hold, caption appears
// 220-260 : electric-pulse ring expands outward from the result
// 260-315 : hold on the result (handoff to the next scene's transition)
const EXPAND_END = 20;
const FIVE_START = 50;
const FIVE_END = 80;
const PULSE_START = 80;
const PULSE_END = 110;
const RING_START = 220;
const RING_END = 260;

export const Scene06Reveal: React.FC<Scene06RevealProps> = ({ voiceId }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const narration = getSceneNarration(voiceId, "reveal");

  // GSAP-driven "5" snap: an elastic overshoot that reads as a jolt of
  // electricity, plus a quick punch-scale on the whole equation at the
  // same beat for extra impact.
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .fromTo(
        selector("[data-five]"),
        { scale: 0 },
        {
          scale: 1,
          duration: (FIVE_END - FIVE_START) / fps,
          ease: "elastic.out(1, 0.45)",
        },
        FIVE_START / fps,
      )
      .fromTo(
        selector("[data-equation]"),
        { scale: 1 },
        { scale: 1.06, duration: 0.08, ease: "power2.out", yoyo: true, repeat: 1 },
        FIVE_START / fps,
      );
  });

  const expandScale = interpolate(frame, [0, EXPAND_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const expandOpacity = interpolate(frame, [0, EXPAND_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fiveOpacity = interpolate(frame, [FIVE_START, FIVE_START + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pulseGlow = interpolate(
    frame,
    [PULSE_START, PULSE_END, PULSE_END + 40],
    [0, 1, 0.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const ringProgress = interpolate(frame, [RING_START, RING_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringScale = interpolate(ringProgress, [0, 1], [0.2, 6]);
  const ringOpacity = interpolate(ringProgress, [0, 0.3, 1], [0, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      ref={scope}
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
      {/* Expanding electric ring */}
      <div
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          border: "3px solid #22D3EE",
          transform: `scale(${ringScale})`,
          opacity: ringOpacity,
        }}
      />

      <div
        style={{
          opacity: expandOpacity,
          transform: `scale(${expandScale})`,
        }}
      >
        <div
          data-equation
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 28,
            fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
            fontSize: 108,
            fontWeight: 700,
          }}
        >
          <span
            style={{
              color: "#22D3EE",
              textShadow: "0 0 20px rgba(34,211,238,0.7)",
            }}
          >
            2 + 3 =
          </span>
          <span
            data-five
            style={{
              color: "#A78BFA",
              display: "inline-block",
              opacity: fiveOpacity,
              textShadow: `0 0 ${20 + 30 * pulseGlow}px rgba(167,139,250,${
                0.7 + 0.3 * pulseGlow
              }), 0 0 ${40 + 60 * pulseGlow}px rgba(34,211,238,${0.3 * pulseGlow})`,
            }}
          >
            5
          </span>
        </div>
      </div>

      {narration.audioSrc && <Audio src={narration.audioSrc} premountFor={fps} />}
      <Captions captions={narration.captions} />
      <TransitionSfx triggerAtFrame={FIVE_START} src={ding} volume={0.3} />
      <TransitionSfx triggerAtFrame={300} src={whoosh} />
    </div>
  );
};
