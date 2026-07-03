import type { ReactNode } from 'react'

interface StatRowProps {
  label: string
  value: ReactNode
  /** Крупная строка (итоговая стоимость). */
  emphasis?: boolean
}

export function StatRow({ label, value, emphasis }: StatRowProps) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-[15px] ${
        emphasis ? '' : 'border-b border-line last:border-0'
      }`}
    >
      <span className={emphasis ? 'text-base font-semibold text-ink-muted' : 'text-[14.5px] text-ink-muted'}>
        {label}
      </span>
      <span
        className={`text-right font-mono tabular-nums ${
          emphasis
            ? 'text-2xl font-bold text-cta-strong'
            : 'text-[15px] font-semibold text-ink'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
