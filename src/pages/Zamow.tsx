import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { LazyMapView as MapView } from '../components/map/LazyMapView'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Slider } from '../components/ui/Slider'
import { TopBar } from '../components/ui/TopBar'
import {
  WIZARD_BUDGET_MAX_PLN,
  WIZARD_BUDGET_MIN_PLN,
  WIZARD_TRUCKS_MAX,
  WIZARD_TRUCKS_MIN,
} from '../domain/constants'
import { trucksForBudget } from '../domain/estimator'
import { formatPln, plPlural } from '../i18n/format'
import { allTrucks, useFleetStore } from '../store/fleet'
import { useCampaignStore } from '../store/campaign'

const naczepaForms = { one: 'naczepa', few: 'naczepy', many: 'naczep' }
const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

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
