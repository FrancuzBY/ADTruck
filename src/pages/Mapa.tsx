import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import type maplibregl from 'maplibre-gl'
import { LiveToasts } from '../components/LiveToasts'
import { ShareLiveModal } from '../components/ShareLiveModal'
import { liveUrl } from '../lib/liveUrl'
import { TruckDetailSheet } from '../components/TruckDetailSheet'
import { LazyMapView as MapView } from '../components/map/LazyMapView'
import { SpeedControl } from '../components/map/SpeedControl'
import { routeById } from '../data/routes'
import type { Truck } from '../domain/types'
import { formatEta, formatNumber, plPlural } from '../i18n/format'
import { useTick } from '../hooks/useTick'
import { simNow } from '../sim/clock'
import { cityColumnFeatures, reachHeatFeatures } from '../sim/reach'
import { truckStateAt } from '../sim/simulator'
import { nextStop, routeCityStops } from '../sim/stops'
import { allTrucks, useFleetStore } from '../store/fleet'

const naczepaForms = { one: 'naczepa', few: 'naczepy', many: 'naczep' }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function Mapa() {
  const userTrucks = useFleetStore((s) => s.userTrucks)
  const trucks = useMemo(() => allTrucks(userTrucks), [userTrucks])
  const getTrucks = useMemo(() => () => trucks, [trucks])
  const [showHeat, setShowHeat] = useState(false)
  const [show3d, setShow3d] = useState(false)
  const [picked, setPicked] = useState<Truck | null>(null)
  const [sheet, setSheet] = useState<Truck | null>(null)
  const [tourOn, setTourOn] = useState(false)
  const [share, setShare] = useState(false)
  const [caption, setCaption] = useState<string | null>(null)
  const mapInst = useRef<maplibregl.Map | null>(null)
  const abortTour = useRef(false)
  useTick(1000)

  useEffect(() => () => { abortTour.current = true }, [])

  const heatNow = showHeat ? simNow() : 0
  const heatmap = useMemo(() => reachHeatFeatures(trucks, heatNow || undefined), [trucks, heatNow])
  const columns = useMemo(() => cityColumnFeatures(trucks), [trucks])

  const now = simNow()
  let driving = 0
  let example: Truck | null = null
  for (const t of trucks) {
    const route = routeById(t.routeId)
    if (!route) continue
    if (truckStateAt(now, t, route).isDriving) { driving++; if (!example) example = t }
  }
  const hud = picked ?? example ?? trucks[0] ?? null
  const hudRoute = hud ? routeById(hud.routeId) : null
  const hs = hud && hudRoute ? truckStateAt(now, hud, hudRoute) : null
  const hns = hud && hudRoute ? nextStop(now, hud, hudRoute) : null

  // Кино-автотур ВЫБРАННОЙ фуры (тапнутой на карте), иначе — живого примера.
  async function runTour() {
    const map = mapInst.current
    if (!map || tourOn) return
    const t = simNow()
    const target = picked ?? example ?? trucks[0] ?? null
    const tRoute = target ? routeById(target.routeId) : null
    if (!target || !tRoute) return
    setTourOn(true)
    abortTour.current = false
    const tState = truckStateAt(t, target, tRoute)
    const stops = routeCityStops(tRoute)
    const ns = nextStop(t, target, tRoute)
    const nextCoord = ns ? stops.find((s) => s.name === ns.city) : undefined
    const dest = stops.length ? stops[stops.length - 1] : undefined

    const step = async (opts: maplibregl.EaseToOptions, cap: string, ms: number) => {
      if (abortTour.current) throw new Error('abort')
      setCaption(cap)
      map.easeTo({ ...opts, duration: Math.min(ms - 400, 2600) })
      await sleep(ms)
    }
    try {
      await step({ center: [tState.lng, tState.lat], zoom: 4.4, pitch: 0, bearing: 0 }, `Śledzimy naczepę ${target.plate}`, 2600)
      await step({ center: [tState.lng, tState.lat], zoom: 6.2, pitch: 55, bearing: -20 }, `${target.plate} · ${tRoute.name}${tState.isDriving ? ` · ${tState.speedKmh} km/h` : ' · postój'}`, 3600)
      if (nextCoord) await step({ center: [nextCoord.lng, nextCoord.lat], zoom: 5.8, pitch: 55, bearing: -10 }, `W drodze do: ${ns!.city}${ns?.etaMs != null ? ` · ${formatEta(ns.etaMs)}` : ''}`, 3400)
      if (dest) await step({ center: [dest.lng, dest.lat], zoom: 5.4, pitch: 55, bearing: -14 }, `Cel trasy: ${tRoute.to}`, 3400)
      await step({ center: [13, 50], zoom: 3.7, pitch: 0, bearing: 0 }, `${formatNumber(driving)} ${plPlural(driving, naczepaForms)} w trasie · reklama w ruchu`, 3000)
    } catch { /* прервано */ }
    setCaption(null)
    setTourOn(false)
  }

  const stopTour = () => { abortTour.current = true }

  return (
    <div className="fixed inset-x-0 top-0 bottom-0 z-0 mx-auto max-w-md">
      <MapView
        getTrucks={getTrucks}
        fleetKey={userTrucks.length}
        theme="dark"
        heatmap={heatmap}
        showHeatmap={showHeat}
        columns={columns}
        show3d={show3d}
        onMapReady={(m) => { mapInst.current = m }}
        onSelectTruck={(id) => setPicked(trucks.find((tt) => tt.id === id) ?? null)}
      />

      {/* Кино-подпись поверх тура */}
      <AnimatePresence>
        {caption && (
          <motion.div
            key={caption}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-6 top-28 z-20 text-center"
          >
            <span className="inline-block rounded-2xl border border-neon/30 bg-surface/80 px-4 py-2.5 font-display text-[15px] font-semibold text-ink backdrop-blur-md">
              {caption}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-x-4 top-14 z-10 flex items-start justify-between gap-2.5">
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2 rounded-full border border-neon/30 bg-surface/70 px-3.5 py-2 backdrop-blur-md">
            <span className="size-[7px] animate-[softpulse_1.8s_ease-in-out_infinite] rounded-full bg-neon shadow-[0_0_10px_var(--color-neon)]" />
            <span className="text-[13px] font-semibold text-ink">Mapa na żywo</span>
          </div>
          <button
            type="button"
            onClick={tourOn ? stopTour : runTour}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors ${
              tourOn ? 'border-cta/50 bg-cta/20 text-white' : 'border-line bg-surface/70 text-ink'
            }`}
          >
            {tourOn ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5"><path d="M8 5v14l11-7z" /></svg>
            )}
            {tourOn ? 'Stop' : 'Prezentacja'}
          </button>
          <button
            type="button"
            onClick={() => setShare(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-neon/40 bg-neon/10 px-3 py-1.5 text-xs font-semibold text-neon backdrop-blur-md transition-colors hover:bg-neon/20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h3v3M21 14v7M14 21h7" />
            </svg>
            Udostępnij
          </button>
          {!tourOn && (
            <div className="rounded-2xl border border-line bg-surface/70 px-[15px] py-3 backdrop-blur-md">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-[27px] font-semibold tabular-nums text-live">{formatNumber(driving)}</span>
                <span className="text-[13px] text-ink-muted">{plPlural(driving, naczepaForms)} w trasie</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <SpeedControl />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowHeat((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors ${showHeat ? 'border-warn/50 bg-warn/15 text-warn' : 'border-line bg-surface/70 text-ink-muted'}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><path d="M12 3c1.5 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.4.6-2.6 1.4-3.6C10 8 12 6 12 3Z" /></svg>
              Zasięg
            </button>
            <button
              type="button"
              onClick={() => setShow3d((v) => !v)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-colors ${show3d ? 'border-neon/50 bg-neon/15 text-neon' : 'border-line bg-surface/70 text-ink-muted'}`}
            >
              3D
            </button>
          </div>
        </div>
      </div>

      {hud && hns && !tourOn && (
        <div className="absolute inset-x-4 bottom-[104px] z-10 rounded-[20px] border border-line bg-surface/85 px-[17px] py-3.5 shadow-card backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-faint">{picked ? 'Wybrana naczepa' : 'Naczepa na żywo'}</span>
            <span className="font-mono text-sm tabular-nums text-neon">{hs?.isDriving ? `${hs.speedKmh} km/h` : 'postój'}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`size-[9px] rounded-full ${hs?.isDriving ? 'bg-live shadow-[0_0_10px_var(--color-live)]' : 'bg-slate-500'}`} />
              <span className="font-mono text-[15px] font-semibold tracking-wide text-ink">{hud.plate}</span>
            </div>
            <button type="button" onClick={() => setSheet(hud)} className="flex items-center gap-1 text-[12px] font-medium text-neon">
              Szczegóły
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
            </button>
          </div>
          <div className="mt-2 flex items-center gap-1.5 border-t border-line pt-2 text-[12.5px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-live)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5"><path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
            <span className="min-w-0 flex-1 truncate text-ink-muted"><span className="text-ink">{hudRoute?.name}</span> → {hns.city}</span>
            <span className="shrink-0 text-ink-faint">{formatEta(hns.etaMs)}</span>
          </div>
          {!picked && <div className="mt-2 text-center text-[10.5px] text-ink-faint">Dotknij dowolnej naczepy na mapie, aby śledzić jej trasę</div>}
        </div>
      )}

      <LiveToasts trucks={trucks} enabled={!tourOn} />

      <AnimatePresence>
        {sheet && <TruckDetailSheet truck={sheet} onClose={() => setSheet(null)} />}
        {share && (
          <ShareLiveModal
            url={liveUrl('/mapa')}
            title="Mapa na żywo"
            subtitle="Cała flota w czasie rzeczywistym — na Twoim telefonie"
            onClose={() => setShare(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
