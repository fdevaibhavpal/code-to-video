interface CircuitTraceProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  // 0 = not drawn, 1 = fully drawn (deterministic line-draw effect)
  progress: number;
  active?: boolean;
  strokeWidth?: number;
}

// A single animated circuit trace (an L-shaped or straight line) that draws
// itself in via stroke-dasharray, then glows cyan when `active`.
export const CircuitTrace: React.FC<CircuitTraceProps> = ({
  x1,
  y1,
  x2,
  y2,
  progress,
  active = false,
  strokeWidth = 3,
}) => {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const dashOffset = length * (1 - progress);

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={active ? "#22D3EE" : "#2A3A48"}
      strokeWidth={strokeWidth}
      strokeDasharray={length}
      strokeDashoffset={dashOffset}
      style={{
        filter: active ? "drop-shadow(0 0 6px rgba(34,211,238,0.7))" : "none",
      }}
    />
  );
};
