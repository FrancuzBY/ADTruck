import { useMemo } from 'react'
import { Link } from 'react-router'
import { routeById } from '../data/routes'
import { formatNumber, plPlural } from '../i18n/format'
import { useTick } from '../hooks/useTick'
import { simNow } from '../sim/clock'
import { CARRIERS } from '../sim/fleet'
import { truckStateAt } from '../sim/simulator'
import { allTrucks, useFleetStore } from '../store/fleet'

const MINE = CARRIERS[0].id
const naczepaForms = { one: 'naczepa', few: 'naczepy', many: 'naczep' }

export function Flota() {
  const userTrucks = useFleetStore((s) => s.userTrucks)
  useTick(1000)
  const myTrucks = useMemo(
    () => allTrucks(userTrucks).filter((t) => t.carrierId === MINE),
    [userTrucks],
  )
  const now = simNow()

  return (
    <div className="min-h-full bg-canvas px-[18px] pt-[70px] pb-4">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-[31px] font-extrabold tracking-tight text-ink">Moja flota</h1>
        <span className="font-mono text-sm tabular-nums text-ink-muted">
          {myTrucks.length} {plPlural(myTrucks.length, naczepaForms)}
        </span>
      </div>

      <div className="mt-5 space-y-2.5">
        {myTrucks.map((t) => {
          const route = routeById(t.routeId)
          const s = route ? truckStateAt(now, t, route) : null
          const driving = !!s?.isDriving
          const dot = driving ? 'var(--color-live)' : '#5c6b82'
          return (
            <div
              key={t.id}
              className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface px-4 py-3.5"
            >
              <span className="relative flex size-2.5 shrink-0 items-center justify-center">
                {driving && (
                  <span
                    className="absolute inset-[-5px] animate-[softpulse_1.9s_ease-in-out_infinite] rounded-full"
                    style={{ background: dot, opacity: 0.28 }}
                  />
                )}
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: dot, boxShadow: driving ? `0 0 8px ${dot}` : undefined }}
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[15px] font-semibold tracking-wide text-ink">{t.plate}</span>
                  {t.addedByUser && (
                    <span className="rounded-md bg-live/15 px-2 py-0.5 text-[10px] font-semibold text-live">
                      nowa
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[12.5px] text-ink-muted">{route?.name ?? '—'}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`font-mono text-sm tabular-nums ${driving ? 'text-neon' : 'text-ink-muted'}`}>
                  {driving ? `${s!.speedKmh} km/h` : 'postój'}
                </p>
                <p className="mt-0.5 font-mono text-[11.5px] text-ink-muted">
                  {s ? `${formatNumber(s.kmToday)} km dziś` : ''}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <Link
        to="/flota/dodaj"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-cta py-4 text-base font-semibold text-white shadow-[0_12px_30px_-10px_rgb(22_163_74_/_0.55)] transition-colors hover:bg-cta-strong"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="size-[18px]">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Dodaj naczepę
      </Link>
    </div>
  )
}
