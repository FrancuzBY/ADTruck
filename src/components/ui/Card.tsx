import type { ReactNode } from 'react'

/** Карточка-поверхность. Токены border/surface/shadow флипаются по теме (.theme-dark). */
export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-card border border-line bg-surface shadow-card ${className}`}>
      {children}
    </div>
  )
}
