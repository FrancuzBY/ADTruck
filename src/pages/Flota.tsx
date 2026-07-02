import { useMemo } from 'react'
import { Link } from 'react-router'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { routeById } from '../data/routes'
import { formatNumber } from '../i18n/format'
import { useTick } from '../hooks/useTick'
import { simNow } from '../sim/clock'
import { CARRIERS } from '../sim/fleet'
import { truckStateAt } from '../sim/simulator'
import { allTrucks, useFleetStore } from '../store/fleet'

const MINE = CARRIERS[0].id

export function Flota() {
  const userTrucks = useFleetStore((s) => s.userTrucks)
  useTick(1000)
  const myTrucks = useMemo(
    () => allTrucks(userTrucks).filter((t) => t.carrierId === MINE),
    [userTrucks],
  )
  const now = simNow()

  return (
    <div className="px-4 pt-12 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Moja flota</h1>
        <span className="text-sm text-ink-muted">{myTrucks.length} naczep</span>
      </div>

      <div className="mt-4 space-y-2.5">
        {myTrucks.map((t) => {
          const route = routeById(t.routeId)
          const s = route ? truckStateAt(now, t, route) : null
          return (
            <Card key={t.id} className="flex items-center gap-3 p-4">
              <span
                className={`size-2.5 shrink-0 rounded-full ${
                  s?.isDriving ? 'bg-cta' : 'bg-slate-300'
                }`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{t.plate}</span>
                  {t.addedByUser && (
                    <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                      nowa
                    </span>
                  )}
                </div>
                <p className="truncate text-sm text-ink-muted">{route?.name ?? '—'}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold">
                  {s?.isDriving ? `${s.speedKmh} km/h` : 'postój'}
                </p>
                <p className="text-xs text-ink-muted">{s ? `${formatNumber(s.kmToday)} km dziś` : ''}</p>
              </div>
            </Card>
          )
        })}
      </div>

      <Link to="/flota/dodaj" className="mt-4 block">
        <Button variant="cta" full>
          + Dodaj naczepę
        </Button>
      </Link>
    </div>
  )
}
