/** Mini gràfic de barres (sense eixos ni números: només la forma). */
export function Sparkline({ values, className = "" }: { values: number[]; className?: string }) {
  const max = Math.max(1, ...values);
  const w = 8;
  const gap = 3;
  const h = 24;
  return (
    <svg width={values.length * (w + gap)} height={h} className={className} aria-hidden>
      {values.map((v, i) => {
        const bh = v === 0 ? 2 : Math.max(3, (v / max) * h);
        return (
          <rect
            key={i}
            x={i * (w + gap)}
            y={h - bh}
            width={w}
            height={bh}
            rx={2}
            fill={v === 0 ? "var(--c-line)" : "var(--c-amber)"}
          />
        );
      })}
    </svg>
  );
}
