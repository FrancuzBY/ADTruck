import { AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import { TruckDetailSheet } from '../components/TruckDetailSheet'
import { LazyMapView as MapView } from '../components/map/LazyMapView'
import { SpeedControl } from '../components/map/SpeedControl'
import { routeById } from '../data/routes'
import type { Truck } from '../domain/types'
import { formatEta, formatNumber, plPlural } from '../i18n/format'
import { useTick } from '../hooks/useTick'
import { simNow } from '../sim/clock'
import { reachHeatFeatures } from '../sim/reach'
import { truckStateAt } from '../sim/simulator'
import { nextStop } from '../sim/stops'
import { allTrucks, useFleetStore } from '../store/fleet'

const naczepaForms = { one: 'naczepa', few: 'naczepy', many: 'naczep' }

export function Mapa() {
  const userTrucks = useFleetStore((s) => s.userTrucks)
  const trucks = useMemo(() => allTrucks(userTrucks), [userTrucks])
  const getTrucks = useMemo(() => () => trucks, [trucks])
  const [showHeat, setShowHeat] = useState(false)
  const [picked, setPicked] = useState<Truck | null>(null) // выбранная кликом на карте
  const [sheet, setSheet] = useState<Truck | null>(null) // открытая карточка
  useTick(1000)

  const heatNow = showHeat ? simNow() : 0
  const heatmap = useMemo(() => reachHeatFeatures(trucks, heatNow || undefined), [trucks, heatNow])

  const now = simNow()
  let driving = 0
  let example: Truck | null = null
  for (const t of trucks) {
    const route = routeById(t.routeId)
    if (!route) continue
    if (truckStateAt(now, t, route).isDriving) {
      driving++
      if (!example) example = t
    }
  }

  // «Текущая» на HUD = выбранная кликом, иначе живой пример (первая едущая фура).
  const hud = picked ?? example ?? trucks[0] ?? null
  const hudRoute = hud ? routeById(hud.routeId) : null
  const hs = hud && hudRoute ? truckStateAt(now, hud, hudRoute) : null
  const hns = hud && hudRoute ? nextStop(now, hud, hudRoute) : null

  return (
    <div className="fixed inset-x-0 top-0 bottom-0 z-0 mx-auto max-w-md">
      <MapView
        getTrucks={getTrucks}
        fleetKey={userTrucks.length}
        theme="dark"
        heatmap={heatmap}
        showHeatmap={showHeat}
        onSelectTruck={(id) => setPicked(trucks.find((t) => t.id === id) ?? null)}
      />

      <div className="absolute inset-x-4 top-14 z-10 flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2 rounded-full border border-neon/30 bg-surface/70 px-3.5 py-2 backdrop-blur-md">
          <span className="size-[7px] animate-[softpulse_1.8s_ease-in-out_infinite] rounded-full bg-neon shadow-[0_0_10px_var(--color-neon)]" />
          <span className="text-[13px] font-semibold text-ink">Mapa na żywo</span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <SpeedControl />
          <button
            type="button"
            onClick={() => setShowHeat((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors ${
              showHeat ? 'border-warn/50 bg-warn/15 text-warn' : 'border-line bg-surface/70 text-ink-muted'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <path d="M12 3c1.5 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.4.6-2.6 1.4-3.6C10 8 12 6 12 3Z" />
            </svg>
            Zasięg
          </button>
        </div>
      </div>

      <div className="absolute top-[104px] left-4 z-10 rounded-2xl border border-line bg-surface/70 px-[15px] py-3 backdrop-blur-md">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[27px] font-semibold tabular-nums text-live">{formatNumber(driving)}</span>
          <span className="text-[13px] text-ink-muted">{plPlural(driving, naczepaForms)} w trasie</span>
        </div>
      </div>

      {hud && hns && (
        <div className="absolute inset-x-4 bottom-[104px] z-10 rounded-[20px] border border-line bg-surface/85 px-[17px] py-3.5 shadow-card backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-faint">
              {picked ? 'Wybrana naczepa' : 'Naczepa na żywo'}
            </span>
            <span className="font-mono text-sm tabular-nums text-neon">{hs?.isDriving ? `${hs.speedKmh} km/h` : 'postój'}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`size-[9px] rounded-full ${hs?.isDriving ? 'bg-live shadow-[0_0_10px_var(--color-live)]' : 'bg-slate-500'}`} />
              <span className="font-mono text-[15px] font-semibold tracking-wide text-ink">{hud.plate}</span>
            </div>
            <button type="button" onClick={() => setSheet(hud)} className="flex items-center gap-1 text-[12px] font-medium text-neon">
              Szczegóły
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
              </svg>
            </button>
          </div>
          <div className="mt-2 flex items-center gap-1.5 border-t border-line pt-2 text-[12.5px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-live)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" />
            </svg>
            <span className="min-w-0 flex-1 truncate text-ink-muted">
              <span className="text-ink">{hudRoute?.name}</span> → {hns.city}
            </span>
            <span className="shrink-0 text-ink-faint">{formatEta(hns.etaMs)}</span>
          </div>
          {!picked && (
            <div className="mt-2 text-center text-[10.5px] text-ink-faint">Dotknij dowolnej naczepy na mapie, aby śledzić jej trasę</div>
          )}
        </div>
      )}

      <AnimatePresence>
        {sheet && <TruckDetailSheet truck={sheet} onClose={() => setSheet(null)} />}
      </AnimatePresence>
    </div>
  )
}
