import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { useGsapTimeline } from "@remotion/gsap";
import { whoosh } from "@remotion/sfx";
import { Captions } from "../components/Caption";
import { TransitionSfx } from "../components/TransitionSfx";
import { getSceneNarration } from "../data/useNarration";

interface Scene01HookProps {
  voiceId: string;
}

// Local timeline (90 frames @ 30fps = 3s):
// 0-36   : type "2 + 3" character by character
// 36-54  : hold, blinking cursor
// 54-72  : reveal "= ?"
// 72-90  : snap-zoom into a bright point
const TEXT = "2 + 3";
const TYPE_START = 0;
const TYPE_END = 36;
const QUESTION_START = 54;
const QUESTION_END = 72;
const ZOOM_START = 72;
const ZOOM_END = 90;

export const Scene01Hook: React.FC<Scene01HookProps> = ({ voiceId }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const narration = getSceneNarration(voiceId, "hook");

  // GSAP-driven punch: the "= ?" overshoots past full size then settles,
  // and the whole equation gets a sharp power4 snap-zoom at the very end.
  // The timeline is paused and seeked to the current frame by Remotion.
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .fromTo(
        selector("[data-question]"),
        { scale: 0.4 },
        {
          scale: 1,
          duration: (QUESTION_END - QUESTION_START) / fps,
          ease: "back.out(2.6)",
        },
        QUESTION_START / fps,
      )
      .fromTo(
        selector("[data-zoom-target]"),
        { scale: 1 },
        {
          scale: 14,
          duration: (ZOOM_END - ZOOM_START) / fps,
          ease: "power4.in",
        },
        ZOOM_START / fps,
      );
  });

  const charsVisible = Math.floor(
    interpolate(frame, [TYPE_START, TYPE_END], [0, TEXT.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const visibleText = TEXT.slice(0, charsVisible);
  const typingDone = frame >= TYPE_END;
  const cursorBlinkOn = Math.floor(frame / 15) % 2 === 0;

  const questionOpacity = interpolate(
    frame,
    [QUESTION_START, QUESTION_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const zoomProgress = interpolate(frame, [ZOOM_START, ZOOM_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sceneOpacityNearEnd = interpolate(zoomProgress, [0.7, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flashOpacity = interpolate(zoomProgress, [0.75, 1], [0, 1], {
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
      <div
        data-zoom-target
        style={{
          opacity: sceneOpacityNearEnd,
          display: "flex",
          alignItems: "baseline",
          gap: 24,
          fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
          fontSize: 120,
          fontWeight: 700,
        }}
      >
        <span
          style={{
            color: "#22D3EE",
            textShadow:
              "0 0 20px rgba(34,211,238,0.8), 0 0 60px rgba(34,211,238,0.4)",
          }}
        >
          {visibleText}
          {!typingDone && cursorBlinkOn && (
            <span style={{ color: "#22D3EE" }}>|</span>
          )}
          {typingDone && cursorBlinkOn && frame < QUESTION_START && (
            <span style={{ color: "#22D3EE" }}>|</span>
          )}
        </span>
        <span
          data-question
          style={{
            display: "inline-block",
            color: "#A78BFA",
            opacity: questionOpacity,
            textShadow:
              "0 0 20px rgba(167,139,250,0.8), 0 0 60px rgba(167,139,250,0.4)",
          }}
        >
          = ?
        </span>
      </div>

      {/* Bright point flash at the very end of the snap-zoom */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "#EAFEFF",
          opacity: flashOpacity,
        }}
      />

      {narration.audioSrc && <Audio src={narration.audioSrc} premountFor={fps} />}
      <Captions captions={narration.captions} />
      <TransitionSfx triggerAtFrame={ZOOM_END} src={whoosh} />
    </div>
  );
};
