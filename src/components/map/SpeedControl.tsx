import { useAppStore, type SimSpeed } from '../../store/app'

const OPTIONS: SimSpeed[] = [1, 60]

/** Пилюля 1x/60x поверх карты. На 60x «жизнь» ускоряется до перезагрузки (детерминизм 1x). */
export function SpeedControl() {
  const { simSpeed, setSimSpeed } = useAppStore()
  return (
    <div className="pointer-events-auto inline-flex rounded-full bg-surface/95 p-1 shadow-card backdrop-blur">
      {OPTIONS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setSimSpeed(s)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
            simSpeed === s ? 'bg-brand text-white' : 'text-ink-muted hover:text-ink'
          }`}
        >
          {s}×
        </button>
      ))}
    </div>
  )
}
