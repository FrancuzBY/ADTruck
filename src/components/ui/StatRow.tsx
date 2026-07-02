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
      className={`flex items-baseline justify-between gap-4 py-3 ${
        emphasis ? '' : 'border-b border-line last:border-0'
      }`}
    >
      <span className={`text-ink-muted ${emphasis ? 'text-base font-semibold' : 'text-sm'}`}>
        {label}
      </span>
      <span
        className={`text-right tabular-nums ${
          emphasis ? 'text-2xl font-bold text-cta-strong' : 'font-semibold text-ink'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
