import { pl } from '../i18n/pl'
import { resetDemo, useAppStore, type Role, type SimSpeed } from '../store/app'

const roleOptions: { value: Role; label: string }[] = [
  { value: 'advertiser', label: pl.roles.advertiser },
  { value: 'carrier', label: pl.roles.carrier },
]

const speedOptions: SimSpeed[] = [1, 60]

export function Profil() {
  const { role, setRole, simSpeed, setSimSpeed } = useAppStore()

  return (
    <div className="px-4 pt-12">
      <h1 className="text-2xl font-bold">{pl.profil.title}</h1>

      <section className="mt-4 rounded-card bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold text-ink-muted">{pl.profil.roleLabel}</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {roleOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              className={`rounded-full py-2.5 text-sm font-semibold transition-colors ${
                role === opt.value
                  ? 'bg-brand text-white'
                  : 'bg-brand-soft text-brand hover:bg-brand/15'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-card bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold text-ink-muted">{pl.profil.speedLabel}</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {speedOptions.map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => setSimSpeed(speed)}
              className={`rounded-full py-2.5 text-sm font-semibold transition-colors ${
                simSpeed === speed
                  ? 'bg-brand text-white'
                  : 'bg-brand-soft text-brand hover:bg-brand/15'
              }`}
            >
              {speed}×
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-card bg-surface p-5 shadow-card">
        <p className="text-xs leading-relaxed text-ink-muted">{pl.profil.pwaHint}</p>
        <button
          type="button"
          onClick={resetDemo}
          className="mt-4 w-full rounded-full border border-line py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-canvas"
        >
          {pl.profil.resetDemo}
        </button>
      </section>
    </div>
  )
}
