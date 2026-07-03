import { pl } from '../i18n/pl'
import { resetDemo, useAppStore, type SimSpeed } from '../store/app'

const speedOptions: SimSpeed[] = [1, 60]
const eyebrow = 'font-mono text-[11.5px] tracking-[0.1em] text-ink-faint uppercase'

export function Profil() {
  const { role, setRole, simSpeed, setSimSpeed } = useAppStore()
  const carrier = role === 'carrier'

  return (
    <div className="min-h-full bg-gradient-to-b from-white to-canvas px-5 pt-[76px] pb-4">
      <h1 className="font-display text-[31px] font-extrabold tracking-tight text-ink">{pl.profil.title}</h1>

      <section className="mt-6">
        <div className={eyebrow}>{pl.profil.roleLabel}</div>
        <div className="relative mt-3 flex rounded-full bg-[#edf1f8] p-1">
          <div
            className="absolute top-1 bottom-1 left-1 rounded-full bg-brand shadow-[0_6px_14px_rgb(30_58_138_/_0.32)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: 'calc(50% - 4px)', transform: carrier ? 'translateX(100%)' : 'translateX(0)' }}
          />
          <button
            type="button"
            onClick={() => setRole('advertiser')}
            className={`relative z-10 flex-1 py-3 text-[14.5px] font-semibold transition-colors ${carrier ? 'text-brand' : 'text-white'}`}
          >
            {pl.roles.advertiser}
          </button>
          <button
            type="button"
            onClick={() => setRole('carrier')}
            className={`relative z-10 flex-1 py-3 text-[14.5px] font-semibold transition-colors ${carrier ? 'text-white' : 'text-brand'}`}
          >
            {pl.roles.carrier}
          </button>
        </div>
        <p className="mt-2.5 px-0.5 text-[12.5px] leading-snug text-ink-faint">
          Zmiana roli przełącza trzecią zakładkę na dole: Kampanie ↔ Flota.
        </p>
      </section>

      <section className="mt-7">
        <div className={eyebrow}>{pl.profil.speedLabel}</div>
        <div className="mt-3 flex w-[168px] gap-1 rounded-full bg-[#edf1f8] p-1">
          {speedOptions.map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => setSimSpeed(speed)}
              className={`flex-1 rounded-full py-2.5 font-mono text-sm font-semibold transition-colors ${
                simSpeed === speed ? 'bg-brand text-white' : 'text-brand'
              }`}
            >
              {speed}×
            </button>
          ))}
        </div>
      </section>

      <section className="mt-7 rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="text-[15.5px] font-semibold text-ink">Zainstaluj aplikację</div>
        <p className="mt-1.5 mb-4 text-[13.5px] leading-relaxed text-ink-muted">{pl.profil.pwaHint}</p>
        <button
          type="button"
          onClick={resetDemo}
          className="w-full rounded-full border border-line bg-surface py-3.5 text-[14.5px] font-semibold text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
        >
          {pl.profil.resetDemo}
        </button>
      </section>
    </div>
  )
}
