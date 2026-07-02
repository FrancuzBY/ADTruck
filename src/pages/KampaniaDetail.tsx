import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router'
import { MapView } from '../components/map/MapView'
import { Card } from '../components/ui/Card'
import { StatRow } from '../components/ui/StatRow'
import { StatusBadge } from '../components/ui/StatusBadge'
import { TopBar } from '../components/ui/TopBar'
import { countryNamePl } from '../data/countries'
import { formatDate, formatMlnRange, formatNumber, plPlural } from '../i18n/format'
import { useTick } from '../hooks/useTick'
import { simNow } from '../sim/clock'
import { campaignReport } from '../sim/report'
import { allTrucks, useFleetStore } from '../store/fleet'
import { useCampaignStore } from '../store/campaign'

const naczepaForms = { one: 'naczepa', few: 'naczepy', many: 'naczep' }

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

  if (!campaign) return <Navigate to="/kampanie" replace />

  const report = campaignReport(campaign, trucks, simNow())
  const maxTrucks = Math.max(...report.countryStats.map((s) => s.trucks), 1)

  return (
    <div>
      <TopBar title="Raport kampanii" backTo="/kampanie" />
      <div className="space-y-4 px-4 pb-8">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
            </span>
            <StatusBadge status={report.status} />
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-brand" style={{ width: `${report.progress * 100}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">
            Postęp kampanii: {Math.round(report.progress * 100)}%
          </p>
        </Card>

        <Card className="px-5 py-2">
          <StatRow label="Naczepy" value={`${campaign.trucks} ${plPlural(campaign.trucks, naczepaForms)}`} />
          <StatRow label="Przebieg (dotychczas)" value={`${formatNumber(report.km)} km`} />
          <StatRow
            label="Wyświetlenia"
            value={formatMlnRange(report.impressionsMin, report.impressionsMax)}
          />
          <StatRow label="Kraje" value={report.countries.length} />
        </Card>

        {report.countryStats.length > 0 && (
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink-muted">Pokrycie wg krajów</h2>
            <div className="mt-3 space-y-2">
              {report.countryStats.map((s) => (
                <div key={s.code} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-sm text-ink">{countryNamePl(s.code)}</span>
                  <div className="h-5 flex-1 overflow-hidden rounded-md bg-canvas">
                    <div
                      className="h-full rounded-md bg-brand/80"
                      style={{ width: `${(s.trucks / maxTrucks) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-sm font-semibold tabular-nums">
                    {s.trucks}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="overflow-hidden">
          <div className="px-5 pt-5">
            <h2 className="text-sm font-semibold text-ink-muted">Naczepy kampanii na żywo</h2>
          </div>
          <div className="mt-3 h-56 w-full">
            <MapView getTrucks={getTrucks} fleetKey={campaign.id} interactive={false} />
          </div>
        </Card>

        <Card className="border-2 border-dashed border-line bg-transparent p-6 text-center shadow-none">
          <p className="text-sm font-medium text-ink-muted">Kreacja reklamowa</p>
          <p className="mt-1 text-xs text-ink-muted">Wgrywanie plików — wkrótce</p>
        </Card>
      </div>
    </div>
  )
}
