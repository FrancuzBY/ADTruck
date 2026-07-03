import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { LazyMapView as MapView } from '../components/map/LazyMapView'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Slider } from '../components/ui/Slider'
import { TopBar } from '../components/ui/TopBar'
import {
  PRICE_PER_TRUCK_MONTH_PLN,
  WIZARD_BUDGET_MAX_PLN,
  WIZARD_BUDGET_MIN_PLN,
  WIZARD_TRUCKS_MAX,
  WIZARD_TRUCKS_MIN,
} from '../domain/constants'
import { estimateCampaign, trucksForBudget } from '../domain/estimator'
import { formatMlnRange, formatPln, plPlural } from '../i18n/format'
import { allTrucks, useFleetStore } from '../store/fleet'
import { useCampaignStore } from '../store/campaign'

const naczepaForms = { one: 'naczepa', few: 'naczepy', many: 'naczep' }
const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

/** Готовые пакеты — пресеты слайдеров (число бортов + бюджет). Охват считает тот же оценщик. */
const PACKAGES: { key: string; name: string; trucks: number; recommended?: boolean }[] = [
  { key: 'starter', name: 'Starter', trucks: 20 },
  { key: 'reach', name: 'Zasięg', trucks: 50, recommended: true },
  { key: 'max', name: 'Max', trucks: 100 },
]

const dateInput =
  'mt-1.5 w-full rounded-[14px] border border-line bg-surface-2 px-3.5 py-3 font-mono text-sm text-ink [color-scheme:dark]'

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-[18px]">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
)

export function Zamow() {
  const navigate = useNavigate()
  const { draft, setDraft } = useCampaignStore()
  const userTrucks = useFleetStore((s) => s.userTrucks)
  const trucks = useMemo(() => allTrucks(userTrucks), [userTrucks])
  const getTrucks = useMemo(() => () => trucks, [trucks])
  const budgetTrucks = trucksForBudget(draft.budgetPln)

  return (
    <div className="min-h-full bg-canvas">
      <TopBar title="Zamów kampanię" step={1} backTo="/" />
      <motion.div
        className="space-y-3 px-5 pb-10"
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.06 }}
      >
        <motion.div variants={fade}>
          <Card className="p-[18px]">
            <h2 className="text-[13px] font-semibold text-ink-muted">Termin kampanii</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11.5px] text-ink-faint">Od</span>
                <input
                  type="date"
                  value={draft.startDate}
                  max={draft.endDate}
                  onChange={(e) => setDraft({ startDate: e.target.value })}
                  className={dateInput}
                />
              </label>
              <label className="block">
                <span className="text-[11.5px] text-ink-faint">Do</span>
                <input
                  type="date"
                  value={draft.endDate}
                  min={draft.startDate}
                  onChange={(e) => setDraft({ endDate: e.target.value })}
                  className={dateInput}
                />
              </label>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fade}>
          <Card className="overflow-hidden">
            <h2 className="px-[18px] pt-4 pb-2 text-[13px] font-semibold text-ink-muted">Zasięg w Europie</h2>
            <div className="h-[152px] w-full">
              <MapView getTrucks={getTrucks} fleetKey={userTrucks.length} interactive={false} />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fade}>
          <Card className="p-[18px]">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[13px] font-semibold text-ink-muted">Wybierz pakiet</h2>
              <span className="text-[11px] text-ink-faint">dostosuj suwakami niżej</span>
            </div>
            <div className="mt-3.5 grid grid-cols-3 gap-2">
              {PACKAGES.map((p) => {
                const active = draft.trucks === p.trucks
                const est = estimateCampaign({
                  startDate: draft.startDate,
                  endDate: draft.endDate,
                  trucks: p.trucks,
                })
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() =>
                      setDraft({ trucks: p.trucks, budgetPln: p.trucks * PRICE_PER_TRUCK_MONTH_PLN })
                    }
                    className={`relative flex flex-col items-center rounded-2xl border px-1.5 py-3.5 text-center transition-colors ${
                      active ? 'border-neon bg-neon/10' : 'border-line bg-surface-2 hover:border-ink-faint'
                    }`}
                  >
                    {p.recommended && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-cta px-2 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                        Polecany
                      </span>
                    )}
                    <span className="text-[12px] font-semibold text-ink">{p.name}</span>
                    <span className="mt-1.5 font-display text-[26px] leading-none font-extrabold tabular-nums text-ink">
                      {p.trucks}
                    </span>
                    <span className="text-[10.5px] text-ink-muted">naczep</span>
                    <span className="mt-2 font-mono text-[11px] tabular-nums text-live">
                      {formatPln(p.trucks * PRICE_PER_TRUCK_MONTH_PLN)}
                    </span>
                    <span className="text-[9.5px] text-ink-faint">/mies.</span>
                    <span className="mt-1.5 font-mono text-[10px] text-neon">
                      {formatMlnRange(est.impressionsMin, est.impressionsMax)}
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fade}>
          <Card className="space-y-5 p-[18px]">
            <Slider
              label="Liczba naczep"
              value={draft.trucks}
              min={WIZARD_TRUCKS_MIN}
              max={WIZARD_TRUCKS_MAX}
              onChange={(v) => setDraft({ trucks: v })}
              format={(v) => `${v} ${plPlural(v, naczepaForms)}`}
            />
            <div className="h-px bg-line" />
            <Slider
              label="Budżet miesięczny"
              value={draft.budgetPln}
              min={WIZARD_BUDGET_MIN_PLN}
              max={WIZARD_BUDGET_MAX_PLN}
              step={5_000}
              onChange={(v) => setDraft({ budgetPln: v })}
              format={formatPln}
              hint={`Przy tym budżecie: do ${budgetTrucks} ${plPlural(budgetTrucks, naczepaForms)}`}
            />
          </Card>
        </motion.div>

        <motion.div variants={fade} className="pt-1">
          <Button variant="cta" full onClick={() => navigate('/zamow/podsumowanie')}>
            Dalej
            <ArrowRight />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
