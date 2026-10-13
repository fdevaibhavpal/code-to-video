import { interpolate } from "remotion";

interface BinaryStreamProps {
  // 0 (not yet revealed) to 1 (fully revealed), driven by the caller.
  progress: number;
  bits: string;
  fontSize?: number;
}

// Renders a row of binary digits that light up (cyan) as `progress` advances,
// with unrevealed digits dim. Fully deterministic - no per-frame randomness.
export const BinaryStream: React.FC<BinaryStreamProps> = ({
  progress,
  bits,
  fontSize = 48,
}) => {
  const revealCount = progress * bits.length;

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
        fontSize,
        fontWeight: 700,
      }}
    >
      {bits.split("").map((bit, i) => {
        const localGlow = interpolate(revealCount - i, [0, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const color = `rgb(${34 + (232 - 34) * (1 - localGlow)}, ${
          211 + (247 - 211) * (1 - localGlow)
        }, ${238 + (255 - 238) * (1 - localGlow)})`;

        return (
          <span
            key={i}
            style={{
              color,
              opacity: 0.35 + 0.65 * localGlow,
              textShadow:
                localGlow > 0.5
                  ? `0 0 ${12 * localGlow}px rgba(34,211,238,${localGlow})`
                  : "none",
            }}
          >
            {bit}
          </span>
        );
      })}
    </div>
  );
};
