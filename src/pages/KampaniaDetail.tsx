import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router'
import { LazyMapView as MapView } from '../components/map/LazyMapView'
import { StatusBadge } from '../components/ui/StatusBadge'
import { TopBar } from '../components/ui/TopBar'
import { countryNamePl } from '../data/countries'
import { formatDate, formatMlnRange, formatNumber } from '../i18n/format'
import { useCountUp } from '../hooks/useCountUp'
import { useTick } from '../hooks/useTick'
import { simNow } from '../sim/clock'
import { campaignReport } from '../sim/report'
import { allTrucks, useFleetStore } from '../store/fleet'
import { useCampaignStore } from '../store/campaign'

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

export function KampaniaDetail() {
  const { id } = useParams()
  const campaign = useCampaignStore((s) => s.campaigns.find((c) => c.id === id))
  const userTrucks = useFleetStore((s) => s.userTrucks)
  useTick(1000)

  const trucks = useMemo(() => allTrucks(userTrucks), [userTrucks])
  const campaignTrucks = useMemo(
    () => (campaign ? trucks.filter((t) => campaign.truckIds.includes(t.id)) : []),
    [campaign, trucks],
  )
  const getTrucks = useMemo(() => () => campaignTrucks, [campaignTrucks])

  const report = campaign ? campaignReport(campaign, trucks, simNow()) : null
  const km = Math.round(useCountUp(report?.km ?? 0))

  if (!campaign || !report) return <Navigate to="/kampanie" replace />

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
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon to-[#0891b2]"
              style={{ width: `${report.progress * 100}%` }}
            />
          </div>
          <p className="mt-2 text-[12.5px] text-ink-muted">
            Postęp kampanii: <b className="text-ink">{Math.round(report.progress * 100)}%</b>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Tile value={formatNumber(campaign.trucks)} label="Naczepy" color="text-live" />
          <Tile value={formatNumber(km)} unit="km" label="Przebieg (dotychczas)" color="text-ink" />
          <Tile
            value={formatMlnRange(report.impressionsMin, report.impressionsMax)}
            label="Wyświetlenia"
            color="text-neon"
          />
          <Tile value={String(report.countries.length)} label="Kraje" color="text-neon" />
        </div>

        {report.countryStats.length > 0 && (
          <div className="rounded-[20px] border border-line bg-surface p-[18px]">
            <h2 className="text-[13px] font-semibold text-ink-muted">Pokrycie wg krajów</h2>
            <div className="mt-1.5 space-y-2.5 pt-1.5">
              {report.countryStats.map((s) => (
                <div key={s.code} className="flex items-center gap-2.5">
                  <span className="w-[62px] shrink-0 text-[12.5px] text-[#b9c2d0]">{countryNamePl(s.code)}</span>
                  <div className="h-[9px] flex-1 overflow-hidden rounded-[5px] bg-brand-soft">
                    <div
                      className="h-full rounded-[5px] bg-neon"
                      style={{ width: `${(s.trucks / maxTrucks) * 100}%` }}
                    />
                  </div>
                  <span className="w-5 shrink-0 text-right font-mono text-xs tabular-nums text-ink">
                    {s.trucks}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-[20px] border border-line bg-surface">
          <h2 className="px-[18px] pt-4 pb-2 text-[13px] font-semibold text-ink-muted">Naczepy kampanii na żywo</h2>
          <div className="h-[172px] w-full">
            <MapView getTrucks={getTrucks} fleetKey={campaign.id} interactive={false} theme="dark" />
          </div>
        </div>

        <div className="rounded-[18px] border-[1.5px] border-dashed border-[#2a3448] p-[22px] text-center">
          <p className="text-sm font-semibold text-ink-muted">Kreacja reklamowa</p>
          <p className="mt-1 text-[12.5px] text-ink-faint">Wgrywanie plików — wkrótce</p>
        </div>
      </div>
    </div>
  )
}
