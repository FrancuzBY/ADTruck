import type { Creative, Tractor, Trailer } from '../data/vehicles'

function Wheel({ cx }: { cx: number }) {
  return (
    <g>
      <circle cx={cx} cy={120} r="13" fill="#0a0d13" />
      <circle cx={cx} cy={120} r="6.5" fill="#2b3546" />
      <circle cx={cx} cy={120} r="2.4" fill="#5b6b83" />
    </g>
  )
}

/** Виртуальный ТИР сбоку: тягач (цвет кабины по модели) + наczepa с рекламным креативом на борту. */
export function TruckArt({
  creative,
  tractor,
  trailer,
  className = '',
}: {
  creative: Creative
  tractor: Tractor
  trailer: Trailer
  className?: string
}) {
  const nameSize = creative.name.length > 9 ? 20 : creative.name.length > 7 ? 23 : 27

  return (
    <svg viewBox="0 0 360 150" className={className} role="img" aria-label={`${tractor.name}, reklama ${creative.name}`}>
      <ellipse cx="180" cy="139" rx="156" ry="7" fill="rgb(0 0 0 / 0.4)" />

      {/* Наczepa — рекламный борт */}
      <g>
        <rect x="8" y="26" width="238" height="80" rx="9" fill={creative.bg} />
        <rect x="8" y="97" width="238" height="9" rx="0" fill={creative.accent} opacity="0.32" />
        <circle cx="212" cy="70" r="44" fill={creative.accent} opacity="0.16" />

        {/* Деталь кузова по типу */}
        {trailer.kind === 'curtain' &&
          [40, 70, 100, 130, 160, 190].map((x) => (
            <line key={x} x1={x} y1="30" x2={x} y2="102" stroke={creative.fg} strokeWidth="2" opacity="0.08" />
          ))}
        {trailer.kind === 'box' && (
          <>
            {[46, 64, 82].map((y) => (
              <line key={y} x1="14" y1={y} x2="240" y2={y} stroke={creative.fg} strokeWidth="1.5" opacity="0.06" />
            ))}
            <line x1="228" y1="30" x2="228" y2="102" stroke={creative.fg} strokeWidth="2" opacity="0.14" />
          </>
        )}
        {trailer.kind === 'reefer' && (
          <g>
            <rect x="214" y="30" width="24" height="34" rx="4" fill="#0e7490" />
            {[38, 46, 54].map((y) => (
              <line key={y} x1="218" y1={y} x2="234" y2={y} stroke="#a5f3fc" strokeWidth="1.6" opacity="0.7" />
            ))}
          </g>
        )}

        <text
          x="26"
          y="72"
          fill={creative.fg}
          fontFamily="'Bricolage Grotesque Variable', sans-serif"
          fontWeight="800"
          fontSize={nameSize}
          letterSpacing="-0.5"
        >
          {creative.name}
        </text>
        <rect x="8" y="106" width="238" height="5" fill="#0a0d13" />
      </g>

      {/* Сцепка + рама тягача */}
      <rect x="240" y="101" width="106" height="6" fill="#0a0d13" />

      {/* Тягач: кабина цвета модели */}
      <g>
        <rect x="300" y="46" width="48" height="60" rx="9" fill={tractor.cab} />
        <rect x="300" y="40" width="30" height="9" rx="3" fill={tractor.cab} />
        <rect x="323" y="53" width="22" height="22" rx="4" fill="#c7ecf7" opacity="0.92" />
        <rect x="346" y="88" width="6" height="18" rx="2" fill="#0a0d13" />
      </g>

      <Wheel cx={62} />
      <Wheel cx={98} />
      <Wheel cx={312} />
      <Wheel cx={340} />
    </svg>
  )
}
