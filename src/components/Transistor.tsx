interface TransistorProps {
  size: number;
  // 0 = off (dark), 1 = on (glowing cyan)
  state: number;
}

// A simplified procedural SVG transistor symbol (gate + source/drain) that
// lights up when `state` approaches 1.
export const Transistor: React.FC<TransistorProps> = ({ size, state }) => {
  const onColor = "#22D3EE";
  const offColor = "#1E2A38";
  const strokeColor = `rgb(${30 + (34 - 30) * state}, ${42 + (211 - 42) * state}, ${
    56 + (238 - 56) * state
  })`;
  const glow = state * 14;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id={`transistor-glow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={glow / 4} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Gate line (top) */}
      <line x1="50" y1="5" x2="50" y2="30" stroke={strokeColor} strokeWidth="4" />

      {/* Body circle */}
      <circle
        cx="50"
        cy="55"
        r="26"
        fill={state > 0.05 ? "rgba(34,211,238,0.08)" : offColor}
        stroke={strokeColor}
        strokeWidth="4"
        filter="url(#transistor-glow)"
      />

      {/* Source / Drain legs */}
      <line x1="34" y1="78" x2="22" y2="95" stroke={strokeColor} strokeWidth="4" />
      <line x1="66" y1="78" x2="78" y2="95" stroke={strokeColor} strokeWidth="4" />

      {/* Channel indicator dot - bright when on */}
      <circle cx="50" cy="55" r="6" fill={state > 0.5 ? onColor : "#3A4A5A"} />
    </svg>
  );
};
