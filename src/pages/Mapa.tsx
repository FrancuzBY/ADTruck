import { AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import { TruckDetailSheet } from '../components/TruckDetailSheet'
import { LazyMapView as MapView } from '../components/map/LazyMapView'
import { SpeedControl } from '../components/map/SpeedControl'
import { routeById } from '../data/routes'
import type { Truck } from '../domain/types'
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
  const [selected, setSelected] = useState<Truck | null>(null)
  useTick(1000)

  const now = simNow()
  let driving = 0
  let featured: Truck | null = null
  let featuredInfo: { route: string; speed: number } | null = null
  for (const t of trucks) {
    const route = routeById(t.routeId)
    if (!route) continue
    const s = truckStateAt(now, t, route)
    if (s.isDriving) {
      driving++
      if (!featured) { featured = t; featuredInfo = { route: route.name, speed: s.speedKmh } }
    }
  }
  if (!featured && trucks[0]) {
    featured = trucks[0]
    const r = routeById(trucks[0].routeId)
    featuredInfo = { route: r?.name ?? '—', speed: 0 }
  }

  return (
    <div className="fixed inset-x-0 top-0 bottom-0 z-0 mx-auto max-w-md">
      <MapView getTrucks={getTrucks} fleetKey={userTrucks.length} theme="dark" onSelectTruck={(id) => setSelected(trucks.find((t) => t.id === id) ?? null)} />

      <div className="absolute inset-x-4 top-14 z-10 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 rounded-full border border-neon/30 bg-surface/70 px-3.5 py-2 backdrop-blur-md">
          <span className="size-[7px] animate-[softpulse_1.8s_ease-in-out_infinite] rounded-full bg-neon shadow-[0_0_10px_var(--color-neon)]" />
          <span className="text-[13px] font-semibold text-ink">Mapa na żywo</span>
        </div>
        <SpeedControl />
      </div>

      <div className="absolute top-[104px] left-4 z-10 rounded-2xl border border-line bg-surface/70 px-[15px] py-3 backdrop-blur-md">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[27px] font-semibold tabular-nums text-live">{formatNumber(driving)}</span>
          <span className="text-[13px] text-ink-muted">{plPlural(driving, naczepaForms)} w trasie</span>
        </div>
      </div>

      {featured && featuredInfo && (
        <button
          type="button"
          onClick={() => setSelected(featured)}
          className="absolute inset-x-4 bottom-[104px] z-10 rounded-[20px] border border-line bg-surface/85 px-[17px] py-[15px] text-left shadow-card backdrop-blur-lg transition-colors hover:bg-surface"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="size-[9px] rounded-full bg-live shadow-[0_0_10px_var(--color-live)]" />
              <span className="font-mono text-[15px] font-semibold tracking-wide text-ink">{featured.plate}</span>
            </div>
            <span className="font-mono text-sm tabular-nums text-neon">{featuredInfo.speed} km/h</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[13px] text-ink-muted">{featuredInfo.route}</span>
            <span className="flex items-center gap-1 text-[12px] font-medium text-neon">
              Szczegóły
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
              </svg>
            </span>
          </div>
        </button>
      )}

      <AnimatePresence>
        {selected && <TruckDetailSheet truck={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  )
}
