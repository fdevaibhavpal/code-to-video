import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { whip, whoosh } from "@remotion/sfx";
import { CodeEditor, CodeLine } from "../components/CodeEditor";
import { Captions } from "../components/Caption";
import { TransitionSfx } from "../components/TransitionSfx";
import { getSceneNarration } from "../data/useNarration";

interface Scene02CodeProps {
  voiceId: string;
}

// Local timeline (210 frames @ 30fps = 7s, scene starts at 3s global):
// 0-15    : panel fades/slides in
// 15-105  : type the code sample
// 105-130 : hold on finished code
// 130-150 : "CODE" label appears
// 150-175 : "...GIBBERISH?" appears
// 175-210 : dissolve into particles
const PANEL_IN_END = 15;
const TYPE_START = 15;
const TYPE_END = 105;
const CODE_LABEL_START = 130;
const CODE_LABEL_END = 145;
const GIBBERISH_START = 150;
const GIBBERISH_END = 170;
const DISSOLVE_START = 175;
const DISSOLVE_END = 210;

const CODE_LINES: CodeLine[] = [
  {
    tokens: [
      { text: "const ", color: "#A78BFA" },
      { text: "result", color: "#E8FBFF" },
      { text: " = ", color: "#5B7A8C" },
      { text: "2", color: "#F97316" },
      { text: " + ", color: "#5B7A8C" },
      { text: "3", color: "#F97316" },
      { text: ";", color: "#5B7A8C" },
    ],
  },
  {
    tokens: [
      { text: "console", color: "#22D3EE" },
      { text: ".", color: "#5B7A8C" },
      { text: "log", color: "#22D3EE" },
      { text: "(result)", color: "#E8FBFF" },
      { text: ";", color: "#5B7A8C" },
    ],
  },
];

const TOTAL_CHARS = CODE_LINES.reduce(
  (sum, l) => sum + l.tokens.reduce((s, t) => s + t.text.length, 0),
  0,
);

// Deterministic pseudo-random particle layout seeded by index (no Math.random).
const PARTICLE_COUNT = 36;
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i * 137.5) % 360; // golden-angle spread, deterministic
  const radiusSeed = (i * 53) % 100;
  return {
    angle,
    distance: 200 + radiusSeed * 6,
    size: 4 + (i % 5) * 2,
    delay: (i % 10) * 1.5,
  };
});

export const Scene02Code: React.FC<Scene02CodeProps> = ({ voiceId }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const narration = getSceneNarration(voiceId, "code");

  const panelOpacity = interpolate(frame, [0, PANEL_IN_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panelY = interpolate(frame, [0, PANEL_IN_END], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const visibleChars = Math.floor(
    interpolate(frame, [TYPE_START, TYPE_END], [0, TOTAL_CHARS], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  const codeLabelOpacity = interpolate(
    frame,
    [CODE_LABEL_START, CODE_LABEL_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const gibberishOpacity = interpolate(
    frame,
    [GIBBERISH_START, GIBBERISH_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const dissolveProgress = interpolate(
    frame,
    [DISSOLVE_START, DISSOLVE_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const contentOpacity = 1 - dissolveProgress;

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
        overflow: "hidden",
      }}
    >
      <div
        style={{
          opacity: panelOpacity * contentOpacity,
          transform: `translateY(${panelY}px)`,
        }}
      >
        <CodeEditor
          lines={CODE_LINES}
          visibleChars={visibleChars}
          showCursor={frame < DISSOLVE_START}
          width={880}
          height={260}
        />
      </div>

      <div
        style={{
          marginTop: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          opacity: contentOpacity,
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
            fontSize: 64,
            fontWeight: 700,
            color: "#22D3EE",
            letterSpacing: 6,
            opacity: codeLabelOpacity,
            textShadow: "0 0 24px rgba(34,211,238,0.7)",
          }}
        >
          CODE
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
            fontSize: 44,
            fontWeight: 600,
            color: "#A78BFA",
            letterSpacing: 2,
            opacity: gibberishOpacity,
            textShadow: "0 0 20px rgba(167,139,250,0.6)",
          }}
        >
          ...GIBBERISH?
        </div>
      </div>

      {/* Particle dissolve */}
      {particles.map((p, i) => {
        const localProgress = interpolate(
          dissolveProgress,
          [0, 1],
          [0, 1 + p.delay / 10],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const clamped = Math.min(1, Math.max(0, localProgress));
        const dist = clamped * p.distance;
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * dist;
        const y = Math.sin(rad) * dist;
        const particleOpacity = interpolate(clamped, [0, 0.15, 1], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        if (dissolveProgress <= 0) {
          return null;
        }

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: i % 2 === 0 ? "#22D3EE" : "#A78BFA",
              boxShadow: "0 0 10px currentColor",
              opacity: particleOpacity,
              transform: `translate(${x}px, ${y}px)`,
            }}
          />
        );
      })}

      {narration.audioSrc && <Audio src={narration.audioSrc} premountFor={fps} />}
      <Captions captions={narration.captions} />
      <TransitionSfx triggerAtFrame={DISSOLVE_START} src={whip} volume={0.22} />
      <TransitionSfx triggerAtFrame={DISSOLVE_END} src={whoosh} />
    </div>
  );
};
