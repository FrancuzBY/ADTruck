import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { creativeById, CREATIVES, truckProfile } from '../data/vehicles'
import { routeById } from '../data/routes'
import { PRICE_PER_TRUCK_MONTH_PLN } from '../domain/constants'
import type { Truck } from '../domain/types'
import { formatEta, formatNumber, formatPln } from '../i18n/format'
import { useTick } from '../hooks/useTick'
import { simNow } from '../sim/clock'
import { CARRIERS } from '../sim/fleet'
import { truckStateAt } from '../sim/simulator'
import { nextStop, truckDistanceAlong } from '../sim/stops'
import { creativeIdFor, useFleetStore } from '../store/fleet'
import { FlagIcon } from './ui/FlagIcon'
import { TruckArt } from './TruckArt'

const carrierName = (id: string) => CARRIERS.find((c) => c.id === id)?.name ?? id

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-3">
      <div className="text-[11px] tracking-wide text-ink-faint uppercase">{label}</div>
      <div className="mt-1 flex items-center gap-1.5 text-[14px] font-semibold text-ink">{children}</div>
    </div>
  )
}

export function TruckDetailSheet({ truck, onClose }: { truck: Truck; onClose: () => void }) {
  useTick(1000)
  const overrides = useFleetStore((s) => s.creativeByTruck)
  const setCreative = useFleetStore((s) => s.setCreative)

  const profile = truckProfile(truck.id)
  const creative = creativeById(creativeIdFor(truck.id, overrides))
  const route = routeById(truck.routeId)
  const now = simNow()
  const state = route ? truckStateAt(now, truck, route) : null

  // Позиция вдоль коридора, направление и следующий город + ETA.
  const da = route ? truckDistanceAlong(now, truck, route) : null
  let progress = 0
  let origin = route?.from ?? ''
  let dest = route?.to ?? ''
  if (route && da) {
    progress = da.forward ? da.frac : 1 - da.frac
    if (!da.forward) [origin, dest] = [dest, origin]
  }
  const ns = route ? nextStop(now, truck, route) : null

  // График: накопленный пробег за сегодня (последние ~4 ч).
  const spark: number[] = []
  if (route) for (let k = 11; k >= 0; k--) spark.push(truckStateAt(now - k * 20 * 60 * 1000, truck, route).kmToday)
  const sparkMax = Math.max(...spark, 1)
  const sparkPts = spark
    .map((v, i) => `${(i / (spark.length - 1)) * 100},${26 - (v / sparkMax) * 22}`)
    .join(' ')

  const driving = !!state?.isDriving

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[26px] border-t border-line bg-surface px-5 pt-3 pb-8"
      >
        <div className="mx-auto mb-4 h-[5px] w-10 rounded-full bg-line" />

        {/* Виртуальный ТИР с рекламой */}
        <div className="rounded-2xl border border-line bg-[radial-gradient(120%_120%_at_50%_0%,#1a2233,#0c111b)] p-3">
          <TruckArt creative={creative} tractor={profile.tractor} trailer={profile.trailer} className="w-full" />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`size-2.5 rounded-full ${driving ? 'bg-live shadow-[0_0_8px_var(--color-live)]' : 'bg-slate-500'}`} />
            <span className="font-mono text-xl font-semibold tracking-wide text-ink">{truck.plate}</span>
          </div>
          <span className="flex items-center gap-2 text-sm text-ink-muted">
            <FlagIcon code={profile.country.code} />
            {profile.country.name}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Fact label="Przewoźnik">{carrierName(truck.carrierId)}</Fact>
          <Fact label="Ciągnik">
            <span className="size-2.5 rounded-full" style={{ background: profile.tractor.cab }} />
            {profile.tractor.name}
          </Fact>
          <Fact label="Naczepa">{profile.trailer.label}</Fact>
          <Fact label="Prędkość">
            <span className={driving ? 'text-neon' : 'text-ink-muted'}>
              {driving ? `${state!.speedKmh} km/h` : 'postój'}
            </span>
          </Fact>
        </div>

        {/* Маршрут: пройдено / осталось */}
        {route && (
          <div className="mt-2 rounded-xl border border-line bg-surface-2 p-3.5">
            <div className="flex items-center justify-between text-[13px] font-semibold text-ink">
              <span>{origin}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
              <span>{dest}</span>
            </div>
            <div className="relative mt-2.5 h-1.5 rounded-full bg-line">
              <div className="absolute inset-y-0 left-0 rounded-full bg-live" style={{ width: `${progress * 100}%` }} />
              <div
                className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-live bg-canvas shadow-[0_0_8px_var(--color-live)]"
                style={{ left: `${progress * 100}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[11px] text-ink-faint">Trasa pokonana: {Math.round(progress * 100)}%</span>
              {ns && (
                <span className="text-[11.5px] text-ink-muted">
                  → <span className="font-medium text-ink">{ns.city}</span> · <span className="text-live">{formatEta(ns.etaMs)}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Статистика + график пробега */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-line bg-surface-2 p-3.5">
            <div className="font-mono text-lg font-semibold tabular-nums text-ink">
              {formatNumber(Math.round(state?.kmToday ?? 0))} <span className="text-xs text-ink-muted">km</span>
            </div>
            <div className="mt-0.5 text-[11.5px] text-ink-muted">Przejechano dziś</div>
            <svg viewBox="0 0 100 26" preserveAspectRatio="none" className="mt-2 h-6 w-full">
              <polyline points={sparkPts} fill="none" stroke="var(--color-neon)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
            </svg>
          </div>
          <div className="rounded-xl border border-line bg-surface-2 p-3.5">
            <div className="font-mono text-lg font-semibold tabular-nums text-live">{formatPln(PRICE_PER_TRUCK_MONTH_PLN)}</div>
            <div className="mt-0.5 text-[11.5px] text-ink-muted">Przychód z reklamy / mies.</div>
            <div className="mt-3 text-[11.5px] leading-snug text-ink-faint">Wynajem powierzchni reklamowej na tej naczepie.</div>
          </div>
        </div>

        {/* Выбор креатива */}
        <div className="mt-4">
          <div className="text-[11px] tracking-wide text-ink-faint uppercase">Reklama na naczepie</div>
          <div className="no-sb mt-2.5 flex gap-2 overflow-x-auto pb-1">
            {CREATIVES.map((c) => {
              const active = c.id === creative.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCreative(truck.id, c.id)}
                  className={`flex h-12 w-[92px] flex-none items-center justify-center rounded-lg text-[12px] font-bold transition-transform active:scale-95 ${active ? 'ring-2 ring-neon ring-offset-2 ring-offset-surface' : 'opacity-80'}`}
                  style={{ background: c.bg, color: c.fg }}
                >
                  {c.name}
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}
