/** Мини-флажок страны регистрации (полосы + треугольник для CZ), без внешних ассетов. */
const STRIPES: Record<string, string[]> = {
  PL: ['#ffffff', '#dc143c'],
  DE: ['#000000', '#dd0000', '#ffce00'],
  CZ: ['#ffffff', '#d7141a'],
  LT: ['#fdb913', '#006a44', '#c1272d'],
  SK: ['#ffffff', '#0b4ea2', '#ee1c25'],
  NL: ['#ae1c28', '#ffffff', '#21468b'],
}

export function FlagIcon({ code, className = '' }: { code: string; className?: string }) {
  const stripes = STRIPES[code] ?? ['#334155', '#64748b']
  return (
    <span
      className={`relative inline-block h-3.5 w-5 overflow-hidden rounded-[3px] border border-white/15 align-middle ${className}`}
    >
      <span className="flex h-full w-full flex-col">
        {stripes.map((c, i) => (
          <span key={i} style={{ background: c, flex: 1 }} />
        ))}
      </span>
      {code === 'CZ' && (
        <span
          className="absolute inset-y-0 left-0 w-1/2"
          style={{ background: '#11457e', clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
        />
      )}
    </span>
  )
}
