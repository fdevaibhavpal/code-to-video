export type GateType = "AND" | "OR" | "XOR";

interface LogicGateProps {
  type: GateType;
  width: number;
  height: number;
  active: boolean; // whether the gate's output is currently high
}

// Procedural SVG logic gate shapes (simplified IEC/ANSI style) used in the
// calculation scene to visualize binary addition.
export const LogicGate: React.FC<LogicGateProps> = ({
  type,
  width,
  height,
  active,
}) => {
  const strokeColor = active ? "#22D3EE" : "#3A4A5A";
  const fillColor = active ? "rgba(34,211,238,0.1)" : "transparent";
  const glowFilter = active ? "drop-shadow(0 0 8px rgba(34,211,238,0.8))" : "none";

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 80"
      style={{ filter: glowFilter }}
    >
      {type === "AND" && (
        <path
          d="M 20 10 L 60 10 A 30 30 0 0 1 60 70 L 20 70 Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="4"
        />
      )}
      {type === "OR" && (
        <path
          d="M 15 10 Q 40 10 55 40 Q 40 70 15 70 Q 30 40 15 10 Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="4"
        />
      )}
      {type === "XOR" && (
        <>
          <path
            d="M 8 10 Q 23 40 8 70"
            fill="none"
            stroke={strokeColor}
            strokeWidth="4"
          />
          <path
            d="M 18 10 Q 43 10 58 40 Q 43 70 18 70 Q 33 40 18 10 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="4"
          />
        </>
      )}
      {/* input/output leads */}
      <line x1="0" y1="22" x2="18" y2="22" stroke={strokeColor} strokeWidth="4" />
      <line x1="0" y1="58" x2="18" y2="58" stroke={strokeColor} strokeWidth="4" />
      <line x1="90" y1="40" x2="120" y2="40" stroke={strokeColor} strokeWidth="4" />
    </svg>
  );
};
