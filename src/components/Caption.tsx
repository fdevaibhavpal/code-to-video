import { useMemo } from "react";
import { createTikTokStyleCaptions, type Caption as CaptionType } from "@remotion/captions";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface CaptionsProps {
  captions: CaptionType[];
  // Vertical position from the bottom of the frame, in px.
  bottom?: number;
}

const COMBINE_WITHIN_MS = 1200;
const WORD_POP_MS = 120;

// Word-by-word neon captions: the active word glows cyan and pops in with a
// small scale bounce, already-spoken words sit dim violet-white, upcoming
// words are not yet rendered. Built on @remotion/captions' TikTok-style page
// grouping so this works unchanged if real transcript data is swapped in.
export const Captions: React.FC<CaptionsProps> = ({ captions, bottom = 240 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const pages = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: COMBINE_WITHIN_MS,
      }).pages,
    [captions],
  );

  const page = pages.find(
    (p) => currentMs >= p.startMs && currentMs < p.startMs + p.durationMs,
  );

  if (!page) {
    return null;
  }

  const pageLocalMs = currentMs - page.startMs;
  const pageFadeIn = interpolate(pageLocalMs, [0, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: pageFadeIn,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 14px",
          maxWidth: "88%",
          fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
          fontSize: 46,
          fontWeight: 700,
        }}
      >
        {page.tokens.map((token, i) => {
          const spoken = currentMs >= token.fromMs;
          const tokenLocalMs = currentMs - token.fromMs;
          const popProgress = interpolate(
            tokenLocalMs,
            [0, WORD_POP_MS],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          // Deterministic overshoot: pop past 1.0 then settle to 1.0.
          const popScale = spoken
            ? 1 + Math.max(0, 0.25 * Math.sin(popProgress * Math.PI))
            : 1;

          const isActiveWord =
            currentMs >= token.fromMs && currentMs < token.toMs;

          return (
            <span
              key={`${token.fromMs}-${i}`}
              style={{
                display: "inline-block",
                color: !spoken
                  ? "transparent"
                  : isActiveWord
                    ? "#22D3EE"
                    : "#C9D8E0",
                transform: `scale(${popScale})`,
                textShadow: isActiveWord
                  ? "0 0 18px rgba(34,211,238,0.9), 0 0 36px rgba(34,211,238,0.5)"
                  : spoken
                    ? "0 0 10px rgba(167,139,250,0.25)"
                    : "none",
              }}
            >
              {token.text.trim()}
            </span>
          );
        })}
      </div>
    </div>
  );
};
