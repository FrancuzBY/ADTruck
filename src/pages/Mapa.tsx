import { useMemo } from 'react'
import { LazyMapView as MapView } from '../components/map/LazyMapView'
import { SpeedControl } from '../components/map/SpeedControl'
import { routeById } from '../data/routes'
import { formatNumber, plPlural } from '../i18n/format'
import { useTick } from '../hooks/useTick'
import { simNow } from '../sim/clock'
import { truckStateAt } from '../sim/simulator'
import { allTrucks, useFleetStore } from '../store/fleet'

const naczepaForms = { one: 'naczepa', few: 'naczepy', many: 'naczep' }

export function Mapa() {
  const userTrucks = useFleetStore((s) => s.userTrucks)
  const trucks = useMemo(() => allTrucks(userTrucks), [userTrucks])
  const getTrucks = useMemo(() => () => trucks, [trucks])
  useTick(1000)

  // Живой HUD: считаем едущие фуры и берём первую в движении как «избранную».
  const now = simNow()
  let driving = 0
  let featured: { plate: string; route: string; speed: number; country: string } | null = null
  for (const t of trucks) {
    const route = routeById(t.routeId)
    if (!route) continue
    const s = truckStateAt(now, t, route)
    if (s.isDriving) {
      driving++
      if (!featured) featured = { plate: t.plate, route: route.name, speed: s.speedKmh, country: route.to }
    }
  }

  return (
    <div className="fixed inset-x-0 top-0 bottom-0 z-0 mx-auto max-w-md">
      <MapView getTrucks={getTrucks} fleetKey={userTrucks.length} theme="dark" />

      {/* Верхняя строка: статус + скорость */}
      <div className="absolute inset-x-4 top-14 z-10 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 rounded-full border border-neon/30 bg-surface/70 px-3.5 py-2 backdrop-blur-md">
          <span className="size-[7px] animate-[softpulse_1.8s_ease-in-out_infinite] rounded-full bg-neon shadow-[0_0_10px_var(--color-neon)]" />
          <span className="text-[13px] font-semibold text-ink">Mapa na żywo</span>
        </div>
        <SpeedControl />
      </div>

      {/* Счётчик едущих фур */}
      <div className="absolute top-[104px] left-4 z-10 rounded-2xl border border-line bg-surface/70 px-[15px] py-3 backdrop-blur-md">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[27px] font-semibold tabular-nums text-live">
            {formatNumber(driving)}
          </span>
          <span className="text-[13px] text-ink-muted">{plPlural(driving, naczepaForms)} w trasie</span>
        </div>
      </div>

      {/* HUD избранной фуры */}
      {featured && (
        <div className="absolute inset-x-4 bottom-[104px] z-10 rounded-[20px] border border-line bg-surface/85 px-[17px] py-[15px] shadow-card backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="size-[9px] rounded-full bg-live shadow-[0_0_10px_var(--color-live)]" />
              <span className="font-mono text-[15px] font-semibold tracking-wide text-ink">
                {featured.plate}
              </span>
            </div>
            <span className="font-mono text-sm tabular-nums text-neon">{featured.speed} km/h</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[13px] text-ink-muted">{featured.route}</span>
            <span className="text-xs text-ink-muted">{featured.country}</span>
          </div>
          <svg viewBox="0 0 260 26" preserveAspectRatio="none" className="mt-2.5 h-6 w-full">
            <polyline
              points="0,18 20,15 40,17 60,10 80,13 100,7 120,12 140,6 160,10 180,5 200,9 220,4 240,8 260,5"
              fill="none"
              stroke="var(--color-neon)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
