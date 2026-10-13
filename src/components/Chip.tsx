interface ChipProps {
  size: number;
  glowIntensity?: number; // 0 to 1
}

// A procedural SVG CPU/chip silhouette with pins, used as the zoom target
// between the binary scene and the transistor scene.
export const Chip: React.FC<ChipProps> = ({ size, glowIntensity = 0.6 }) => {
  const pinCount = 6;
  const pinSpacing = size / (pinCount + 1);

  const pins = Array.from({ length: pinCount }, (_, i) => (i + 1) * pinSpacing);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id="chip-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={size * 0.015 * glowIntensity} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Pins */}
      {pins.map((pos, i) => (
        <g key={`pin-${i}`}>
          <rect
            x={pos - size * 0.015}
            y={-size * 0.06}
            width={size * 0.03}
            height={size * 0.06}
            fill="#22D3EE"
            opacity={0.7}
          />
          <rect
            x={pos - size * 0.015}
            y={size}
            width={size * 0.03}
            height={size * 0.06}
            fill="#22D3EE"
            opacity={0.7}
          />
          <rect
            x={-size * 0.06}
            y={pos - size * 0.015}
            width={size * 0.06}
            height={size * 0.03}
            fill="#22D3EE"
            opacity={0.7}
          />
          <rect
            x={size}
            y={pos - size * 0.015}
            width={size * 0.06}
            height={size * 0.03}
            fill="#22D3EE"
            opacity={0.7}
          />
        </g>
      ))}

      {/* Chip body */}
      <rect
        x={0}
        y={0}
        width={size}
        height={size}
        rx={size * 0.06}
        fill="#0A0F1A"
        stroke="#22D3EE"
        strokeWidth={size * 0.006}
        filter="url(#chip-glow)"
      />

      {/* Internal circuit pattern */}
      <g opacity={0.5} stroke="#A78BFA" strokeWidth={size * 0.004} fill="none">
        <rect
          x={size * 0.25}
          y={size * 0.25}
          width={size * 0.5}
          height={size * 0.5}
          rx={size * 0.02}
        />
        <line x1={size * 0.25} y1={size * 0.5} x2={size * 0.1} y2={size * 0.5} />
        <line x1={size * 0.75} y1={size * 0.5} x2={size * 0.9} y2={size * 0.5} />
        <line x1={size * 0.5} y1={size * 0.25} x2={size * 0.5} y2={size * 0.1} />
        <line x1={size * 0.5} y1={size * 0.75} x2={size * 0.5} y2={size * 0.9} />
      </g>
    </svg>
  );
};
