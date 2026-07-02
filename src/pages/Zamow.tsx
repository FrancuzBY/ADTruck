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

export function Zamow() {
  const navigate = useNavigate()
  const { draft, setDraft } = useCampaignStore()
  const userTrucks = useFleetStore((s) => s.userTrucks)
  const trucks = useMemo(() => allTrucks(userTrucks), [userTrucks])
  const getTrucks = useMemo(() => () => trucks, [trucks])
  const budgetTrucks = trucksForBudget(draft.budgetPln)

  return (
    <div>
      <TopBar title="Zamów kampanię" step={1} backTo="/" />
      <motion.div
        className="space-y-4 px-4 pb-8"
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.06 }}
      >
        <motion.div variants={fade}>
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink-muted">Termin kampanii</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-ink-muted">Od</span>
                <input
                  type="date"
                  value={draft.startDate}
                  max={draft.endDate}
                  onChange={(e) => setDraft({ startDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm font-medium text-ink"
                />
              </label>
              <label className="block">
                <span className="text-xs text-ink-muted">Do</span>
                <input
                  type="date"
                  value={draft.endDate}
                  min={draft.startDate}
                  onChange={(e) => setDraft({ endDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm font-medium text-ink"
                />
              </label>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fade}>
          <Card className="overflow-hidden">
            <div className="px-5 pt-5">
              <h2 className="text-sm font-semibold text-ink-muted">Zasięg w Europie</h2>
            </div>
            <div className="mt-3 h-44 w-full">
              <MapView getTrucks={getTrucks} fleetKey={userTrucks.length} interactive={false} />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fade}>
          <Card className="space-y-6 p-5">
            <Slider
              label="Liczba naczep"
              value={draft.trucks}
              min={WIZARD_TRUCKS_MIN}
              max={WIZARD_TRUCKS_MAX}
              onChange={(v) => setDraft({ trucks: v })}
              format={(v) => `${v} ${plPlural(v, naczepaForms)}`}
            />
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

        <motion.div variants={fade}>
          <Button variant="cta" full onClick={() => navigate('/zamow/podsumowanie')}>
            Dalej
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
