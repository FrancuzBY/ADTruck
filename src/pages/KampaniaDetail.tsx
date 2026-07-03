import { AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { TruckDetailSheet } from '../components/TruckDetailSheet'
import { LazyMapView as MapView } from '../components/map/LazyMapView'
import { StatusBadge } from '../components/ui/StatusBadge'
import { TopBar } from '../components/ui/TopBar'
import { countryNamePl } from '../data/countries'
import { routeById } from '../data/routes'
import { parseISODate } from '../domain/dates'
import { estimateCampaign } from '../domain/estimator'
import type { Truck } from '../domain/types'
import { formatDate, formatEta, formatMlnRange, formatNumber, formatPln } from '../i18n/format'
import { useCountUp } from '../hooks/useCountUp'
import { useTick } from '../hooks/useTick'
import { simNow } from '../sim/clock'
import { campaignFeed } from '../sim/feed'
import { reachHeatFeatures } from '../sim/reach'
import { campaignReport } from '../sim/report'
import { kmInInterval } from '../sim/schedule'
import { truckParams } from '../sim/simulator'
import { nextStop } from '../sim/stops'
import { allTrucks, useFleetStore } from '../store/fleet'
import { useCampaignStore } from '../store/campaign'

const DAY_MS = 24 * 60 * 60 * 1000

function Tile({ value, unit, label, color }: { value: string; unit?: string; label: string; color: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-[15px]">
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-2xl font-semibold tabular-nums ${color}`}>{value}</span>
        {unit && <span className="font-mono text-[13px] text-ink-muted">{unit}</span>}
      </div>
      <div className="mt-1 text-xs text-ink-muted">{label}</div>
    </div>
  )
}

function BudgetRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className={`font-mono text-[15px] font-semibold tabular-nums ${accent ?? 'text-ink'}`}>{value}</span>
    </div>
  )
}

export function KampaniaDetail() {
  const { id } = useParams()
  const campaign = useCampaignStore((s) => s.campaigns.find((c) => c.id === id))
  const userTrucks = useFleetStore((s) => s.userTrucks)
  const [selected, setSelected] = useState<Truck | null>(null)
  const [showHeat, setShowHeat] = useState(false)
  useTick(1000)

  const trucks = useMemo(() => allTrucks(userTrucks), [userTrucks])
  const campaignTrucks = useMemo(
    () => (campaign ? trucks.filter((t) => campaign.truckIds.includes(t.id)) : []),
    [campaign, trucks],
  )
  const getTrucks = useMemo(() => () => campaignTrucks, [campaignTrucks])
  const heatmap = useMemo(() => reachHeatFeatures(campaignTrucks), [campaignTrucks])

  const now = simNow()
  const report = campaign ? campaignReport(campaign, trucks, now) : null
  const km = Math.round(useCountUp(report?.km ?? 0))
  const imp = Math.round(useCountUp(report?.impressions ?? 0))

  if (!campaign || !report) return <Navigate to="/kampanie" replace />

  const est = estimateCampaign(campaign)
  const total = est.pricePln
  const spentPln = Math.round(total * report.progress)
  const perTruckMoney = Math.round(total / Math.max(campaign.trucks, 1))
  const startMs = parseISODate(campaign.startDate).getTime()
  const untilMs = Math.min(now, parseISODate(campaign.endDate).getTime() + DAY_MS)

  const perTruck = campaignTrucks
    .map((t) => {
      const r = routeById(t.routeId)
      const tkm = r && untilMs > startMs ? kmInInterval(startMs, untilMs, truckParams(t.id).speedFactor) : 0
      const ns = r ? nextStop(now, t, r) : null
      return { truck: t, route: r?.name ?? '—', km: Math.round(tkm), next: ns?.city, eta: ns?.etaMs ?? null }
    })
    .sort((a, b) => b.km - a.km)

  const feed = campaignFeed(campaignTrucks, report.impressions, now)
  const maxTrucks = Math.max(...report.countryStats.map((s) => s.trucks), 1)

  return (
    <div className="min-h-full bg-canvas px-[18px] pb-4">
      <TopBar title="Raport kampanii" backTo="/kampanie" />

      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[13px] text-ink-muted">
            {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
          </span>
          <StatusBadge status={report.status} dark />
        </div>

        <div>
          <div className="h-1.5 overflow-hidden rounded-full bg-brand-soft">
            <div className="h-full rounded-full bg-gradient-to-r from-neon to-[#0891b2]" style={{ width: `${report.progress * 100}%` }} />
          </div>
          <p className="mt-2 text-[12.5px] text-ink-muted">
            Postęp kampanii: <b className="text-ink">{Math.round(report.progress * 100)}%</b>
          </p>
        </div>

        {/* Puls kampanii: показы в реальном времени + живая лента */}
        <div className="rounded-[20px] border border-line bg-surface p-[18px]">
          <div className="flex items-center gap-2">
            <span className="size-2 animate-[softpulse_1.6s_ease-in-out_infinite] rounded-full bg-live shadow-[0_0_10px_var(--color-live)]" />
            <span className="text-[12px] font-semibold tracking-wide text-ink-muted uppercase">Wyświetlenia na żywo</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-[34px] font-bold tabular-nums text-live">{formatNumber(imp)}</span>
            <span className="font-mono text-[12px] text-ink-faint">{formatMlnRange(report.impressionsMin, report.impressionsMax)}</span>
          </div>
          {feed.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-line pt-3">
              {feed.map((e) => (
                <div key={e.id} className="flex items-center gap-2.5">
                  <span className={`size-1.5 shrink-0 rounded-full ${e.kind === 'milestone' ? 'bg-live' : e.kind === 'country' ? 'bg-warn' : 'bg-neon'}`} />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{e.text}</span>
                  <span className="shrink-0 font-mono text-[10.5px] text-ink-faint">{e.sub}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Tile value={formatNumber(campaign.trucks)} label="Naczepy" color="text-live" />
          <Tile value={formatNumber(km)} unit="km" label="Przebieg (dotychczas)" color="text-ink" />
          <Tile value={formatMlnRange(report.impressionsMin, report.impressionsMax)} label="Wyświetlenia" color="text-neon" />
          <Tile value={String(report.countries.length)} label="Kraje" color="text-neon" />
        </div>

        {/* Бюджет: всего / потрачено / осталось (деньги + км) */}
        <div className="rounded-[20px] border border-line bg-surface p-[18px]">
          <h2 className="text-[13px] font-semibold text-ink-muted">Budżet i zasięg</h2>
          <div className="mt-2 divide-y divide-line">
            <BudgetRow label="Budżet całkowity" value={formatPln(total)} />
            <BudgetRow label="Wykorzystano" value={formatPln(spentPln)} accent="text-live" />
            <BudgetRow label="Pozostało" value={formatPln(total - spentPln)} accent="text-neon" />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-soft">
            <div className="h-full rounded-full bg-live" style={{ width: `${report.progress * 100}%` }} />
          </div>
          <p className="mt-3 font-mono text-[11.5px] text-ink-faint">
            Przejechano {formatNumber(report.km)} km z {formatNumber(est.totalKm)} km planu
          </p>
        </div>

        {report.countryStats.length > 0 && (
          <div className="rounded-[20px] border border-line bg-surface p-[18px]">
            <h2 className="text-[13px] font-semibold text-ink-muted">Pokrycie wg krajów</h2>
            <div className="mt-1.5 space-y-2.5 pt-1.5">
              {report.countryStats.map((s) => (
                <div key={s.code} className="flex items-center gap-2.5">
                  <span className="w-[62px] shrink-0 text-[12.5px] text-[#b9c2d0]">{countryNamePl(s.code)}</span>
                  <div className="h-[9px] flex-1 overflow-hidden rounded-[5px] bg-brand-soft">
                    <div className="h-full rounded-[5px] bg-neon" style={{ width: `${(s.trucks / maxTrucks) * 100}%` }} />
                  </div>
                  <span className="w-5 shrink-0 text-right font-mono text-xs tabular-nums text-ink">{s.trucks}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Разбивка по машинам — тап открывает карточку с рекламой */}
        <div className="rounded-[20px] border border-line bg-surface p-[18px]">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[13px] font-semibold text-ink-muted">Naczepy w kampanii</h2>
            <span className="font-mono text-[11px] text-ink-faint">{perTruckMoney ? `${formatPln(perTruckMoney)} / szt.` : ''}</span>
          </div>
          <div className="no-sb mt-2 max-h-[300px] space-y-1.5 overflow-y-auto">
            {perTruck.map(({ truck, route, km: tkm, next, eta }) => (
              <button
                key={truck.id}
                type="button"
                onClick={() => setSelected(truck)}
                className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-left transition-colors hover:bg-surface"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[13px] font-semibold text-ink">{truck.plate}</span>
                  <span className="block truncate text-[11.5px] text-ink-muted">{route}</span>
                  {next && <span className="block truncate text-[10.5px] text-neon">→ {next} · {formatEta(eta)}</span>}
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-mono text-[12.5px] tabular-nums text-ink">{formatNumber(tkm)} km</span>
                  <span className="block font-mono text-[11px] tabular-nums text-live">{formatPln(perTruckMoney)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-line bg-surface">
          <div className="flex items-center justify-between px-[18px] pt-4 pb-2">
            <h2 className="text-[13px] font-semibold text-ink-muted">Naczepy kampanii na żywo</h2>
            <button
              type="button"
              onClick={() => setShowHeat((v) => !v)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${showHeat ? 'border-warn/50 bg-warn/15 text-warn' : 'border-line text-ink-muted'}`}
            >
              Zasięg
            </button>
          </div>
          <div className="h-[172px] w-full">
            <MapView getTrucks={getTrucks} fleetKey={campaign.id} interactive={false} theme="dark" heatmap={heatmap} showHeatmap={showHeat} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && <TruckDetailSheet truck={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  )
}
