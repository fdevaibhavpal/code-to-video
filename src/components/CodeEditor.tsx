import { useCurrentFrame } from "remotion";

// A single syntax token to render. Keeping color decisions in data form
// (rather than a real tokenizer) keeps this deterministic and dependency-free.
export interface CodeToken {
  text: string;
  color: string;
}

export interface CodeLine {
  tokens: CodeToken[];
}

interface CodeEditorProps {
  lines: CodeLine[];
  // Total characters (summed across all lines) that should be visible
  // right now. Drives the typing animation frame-by-frame.
  visibleChars: number;
  // Whether to show the blinking cursor at the current typing position.
  showCursor: boolean;
  width: number;
  height: number;
}

const FONT_SIZE = 30;
const LINE_HEIGHT = 44;
const GUTTER_WIDTH = 64;

const lineCharCount = (line: CodeLine) =>
  line.tokens.reduce((sum, t) => sum + t.text.length, 0);

export const CodeEditor: React.FC<CodeEditorProps> = ({
  lines,
  visibleChars,
  showCursor,
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  let remaining = visibleChars;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 24,
        background: "linear-gradient(180deg, #0A0F1A 0%, #060910 100%)",
        border: "1px solid rgba(34, 211, 238, 0.25)",
        boxShadow:
          "0 0 60px rgba(34, 211, 238, 0.12), inset 0 0 40px rgba(34, 211, 238, 0.04)",
        overflow: "hidden",
        fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 18px",
          borderBottom: "1px solid rgba(34, 211, 238, 0.15)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        {["#FF5F56", "#FFBD2E", "#27C93F"].map((c) => (
          <div
            key={c}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: c,
              opacity: 0.85,
            }}
          />
        ))}
        <div
          style={{
            marginLeft: 12,
            color: "#5B7A8C",
            fontSize: 16,
            letterSpacing: 0.5,
          }}
        >
          main.ts
        </div>
      </div>

      {/* Code body */}
      <div style={{ padding: "20px 0" }}>
        {lines.map((line, i) => {
          const totalLineChars = lineCharCount(line);
          const charsForThisLine = Math.max(0, Math.min(remaining, totalLineChars));
          remaining -= charsForThisLine;

          let charsUsed = 0;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                height: LINE_HEIGHT,
                alignItems: "center",
                fontSize: FONT_SIZE,
                lineHeight: `${LINE_HEIGHT}px`,
                whiteSpace: "pre",
              }}
            >
              <div
                style={{
                  width: GUTTER_WIDTH,
                  textAlign: "right",
                  paddingRight: 18,
                  color: "rgba(91, 122, 140, 0.6)",
                  fontSize: FONT_SIZE - 6,
                }}
              >
                {i + 1}
              </div>
              <div style={{ display: "flex" }}>
                {line.tokens.map((token, ti) => {
                  const tokenStart = charsUsed;
                  charsUsed += token.text.length;
                  const visiblePortion = Math.max(
                    0,
                    Math.min(token.text.length, charsForThisLine - tokenStart),
                  );
                  if (visiblePortion <= 0) {
                    return null;
                  }
                  return (
                    <span key={ti} style={{ color: token.color }}>
                      {token.text.slice(0, visiblePortion)}
                    </span>
                  );
                })}
                {showCursor &&
                  charsForThisLine === totalLineChars &&
                  remaining === 0 &&
                  cursorVisible && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 3,
                        height: FONT_SIZE,
                        marginLeft: 2,
                        background: "#22D3EE",
                        boxShadow: "0 0 8px rgba(34, 211, 238, 0.9)",
                      }}
                    />
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
