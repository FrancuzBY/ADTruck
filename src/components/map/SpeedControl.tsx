import { useAppStore, type SimSpeed } from '../../store/app'

const OPTIONS: SimSpeed[] = [1, 60]

/** Пилюля 1x/60x поверх тёмной карты. На 60x «жизнь» ускоряется до перезагрузки (детерминизм 1x). */
export function SpeedControl() {
  const { simSpeed, setSimSpeed } = useAppStore()
  return (
    <div className="pointer-events-auto inline-flex gap-1 rounded-full border border-line bg-surface/70 p-1 backdrop-blur-md">
      {OPTIONS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setSimSpeed(s)}
          className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold transition-colors ${
            simSpeed === s ? 'bg-neon/15 text-neon' : 'text-ink-muted hover:text-ink'
          }`}
        >
          {s}×
        </button>
      ))}
    </div>
  )
}
