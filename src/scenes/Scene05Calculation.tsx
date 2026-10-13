import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { uiSwitch, whoosh } from "@remotion/sfx";
import { LogicGate } from "../components/LogicGate";
import { CircuitTrace } from "../components/CircuitTrace";
import { Captions } from "../components/Caption";
import { TransitionSfx } from "../components/TransitionSfx";
import { getSceneNarration } from "../data/useNarration";

interface Scene05CalculationProps {
  voiceId: string;
}

// Local timeline (360 frames @ 30fps = 12s, scene starts at 32s global):
// 0-30    : fade in gate diagram (XOR + AND, a half-adder)
// 30-70   : input traces draw in from "2" and "3" binary rows
// 70-130  : gates light up (XOR -> sum bit, AND -> carry bit)
// 130-190 : output traces draw out toward the result
// 190-260 : hold, full circuit lit
// 260-300 : converge into a bright point for the next scene's reveal
// 300-360 : hold on point / fade
const FADE_IN_END = 30;
const INPUT_TRACE_START = 30;
const INPUT_TRACE_END = 70;
const GATE_LIGHT_START = 70;
const GATE_LIGHT_END = 130;
const OUTPUT_TRACE_START = 130;
const OUTPUT_TRACE_END = 190;
const CONVERGE_START = 260;
const CONVERGE_END = 300;

const GATE_W = 160;
const GATE_H = 110;

export const Scene05Calculation: React.FC<Scene05CalculationProps> = ({
  voiceId,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const narration = getSceneNarration(voiceId, "calculation");

  const diagramOpacity = interpolate(frame, [0, FADE_IN_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const inputTraceProgress = interpolate(
    frame,
    [INPUT_TRACE_START, INPUT_TRACE_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const gateActive = frame >= GATE_LIGHT_START + 10;
  const gateGlowProgress = interpolate(
    frame,
    [GATE_LIGHT_START, GATE_LIGHT_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const outputTraceProgress = interpolate(
    frame,
    [OUTPUT_TRACE_START, OUTPUT_TRACE_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const convergeProgress = interpolate(
    frame,
    [CONVERGE_START, CONVERGE_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const diagramScale = interpolate(convergeProgress, [0, 1], [1, 0.05]);
  const diagramFadeOut = interpolate(convergeProgress, [0, 0.8, 1], [1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pointOpacity = interpolate(convergeProgress, [0.6, 1], [0, 1], {
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
          position: "relative",
          width: 700,
          height: 500,
          opacity: diagramOpacity * diagramFadeOut,
          transform: `scale(${diagramScale})`,
        }}
      >
        <svg
          width={700}
          height={500}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* Input traces into XOR (sum) */}
          <CircuitTrace
            x1={40}
            y1={120}
            x2={220}
            y2={150}
            progress={inputTraceProgress}
            active={gateActive}
          />
          <CircuitTrace
            x1={40}
            y1={200}
            x2={220}
            y2={190}
            progress={inputTraceProgress}
            active={gateActive}
          />
          {/* Input traces into AND (carry) */}
          <CircuitTrace
            x1={40}
            y1={320}
            x2={220}
            y2={330}
            progress={inputTraceProgress}
            active={gateActive}
          />
          <CircuitTrace
            x1={40}
            y1={400}
            x2={220}
            y2={370}
            progress={inputTraceProgress}
            active={gateActive}
          />
          {/* Output traces */}
          <CircuitTrace
            x1={420}
            y1={170}
            x2={620}
            y2={170}
            progress={outputTraceProgress}
            active={gateActive}
          />
          <CircuitTrace
            x1={420}
            y1={350}
            x2={620}
            y2={350}
            progress={outputTraceProgress}
            active={gateActive}
          />
        </svg>

        {/* Input labels */}
        {["1", "0"].map((bit, i) => (
          <div
            key={`sum-in-${i}`}
            style={{
              position: "absolute",
              left: 0,
              top: 100 + i * 80,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 28,
              fontWeight: 700,
              color: "#22D3EE",
              opacity: inputTraceProgress,
            }}
          >
            {bit}
          </div>
        ))}
        {["1", "1"].map((bit, i) => (
          <div
            key={`carry-in-${i}`}
            style={{
              position: "absolute",
              left: 0,
              top: 300 + i * 80,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 28,
              fontWeight: 700,
              color: "#22D3EE",
              opacity: inputTraceProgress,
            }}
          >
            {bit}
          </div>
        ))}

        {/* XOR gate -> sum bit */}
        <div style={{ position: "absolute", left: 220, top: 100 }}>
          <LogicGate type="XOR" width={GATE_W} height={GATE_H} active={gateActive} />
        </div>
        {/* AND gate -> carry bit */}
        <div style={{ position: "absolute", left: 220, top: 300 }}>
          <LogicGate type="AND" width={GATE_W} height={GATE_H} active={gateActive} />
        </div>

        {/* Output labels */}
        <div
          style={{
            position: "absolute",
            left: 630,
            top: 150,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 28,
            fontWeight: 700,
            color: gateActive ? "#A78BFA" : "#3A4A5A",
            opacity: outputTraceProgress,
          }}
        >
          sum
        </div>
        <div
          style={{
            position: "absolute",
            left: 630,
            top: 330,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 28,
            fontWeight: 700,
            color: gateActive ? "#A78BFA" : "#3A4A5A",
            opacity: outputTraceProgress,
          }}
        >
          carry
        </div>

        {/* Glow pulse overlay while gates are actively computing */}
        <div
          style={{
            position: "absolute",
            left: 220,
            top: 100,
            width: GATE_W,
            height: GATE_H,
            borderRadius: 20,
            boxShadow: `0 0 ${30 * gateGlowProgress}px rgba(34,211,238,${
              0.5 * gateGlowProgress
            })`,
            pointerEvents: "none",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#EAFEFF",
          boxShadow: "0 0 40px 20px rgba(167,139,250,0.6)",
          opacity: pointOpacity,
        }}
      />

      {narration.audioSrc && <Audio src={narration.audioSrc} premountFor={fps} />}
      <Captions captions={narration.captions} />
      <TransitionSfx triggerAtFrame={GATE_LIGHT_START} src={uiSwitch} volume={0.18} />
      <TransitionSfx triggerAtFrame={360} src={whoosh} />
    </div>
  );
};
