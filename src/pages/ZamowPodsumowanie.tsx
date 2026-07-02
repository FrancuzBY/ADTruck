import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { StatRow } from '../components/ui/StatRow'
import { TopBar } from '../components/ui/TopBar'
import { estimateCampaign } from '../domain/estimator'
import { useCountUp } from '../hooks/useCountUp'
import { formatMlnRange, formatNumber, formatPln, plPlural } from '../i18n/format'
import { useCampaignStore } from '../store/campaign'

const naczepaForms = { one: 'naczepa', few: 'naczepy', many: 'naczep' }
const dayForms = { one: 'dzień', few: 'dni', many: 'dni' }
const monthForms = { one: 'miesiąc', few: 'miesiące', many: 'miesięcy' }

export function ZamowPodsumowanie() {
  const navigate = useNavigate()
  const { draft, createCampaign } = useCampaignStore()
  const est = estimateCampaign(draft)

  // Живые счётчики ключевых цифр.
  const km = Math.round(useCountUp(est.totalKm))
  const price = Math.round(useCountUp(est.pricePln))
  const wholeMonths = Number.isInteger(est.months) ? est.months : null

  const onOrder = () => {
    const campaign = createCampaign()
    navigate('/zamow/potwierdzenie', { state: { id: campaign.id } })
  }

  return (
    <div>
      <TopBar title="Podsumowanie" step={2} />
      <motion.div
        className="space-y-4 px-4 pb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="px-5 py-2">
          <StatRow
            label="Czas trwania"
            value={
              wholeMonths !== null
                ? `${wholeMonths} ${plPlural(wholeMonths, monthForms)}`
                : `${est.days} ${plPlural(est.days, dayForms)}`
            }
          />
          <StatRow label="Liczba naczep" value={`${draft.trucks} ${plPlural(draft.trucks, naczepaForms)}`} />
          <StatRow label="Szacowany przebieg" value={`${formatNumber(km)} km`} />
          <StatRow
            label="Zasięg (wyświetlenia)"
            value={formatMlnRange(est.impressionsMin, est.impressionsMax)}
          />
        </Card>

        <Card className="bg-cta/8 px-5 py-3">
          <StatRow label="Koszt kampanii" value={formatPln(price)} emphasis />
          <p className="pb-2 text-xs text-ink-muted">
            {draft.trucks} × {formatPln(3000)} ×{' '}
            {wholeMonths !== null
              ? `${wholeMonths} ${plPlural(wholeMonths, monthForms)}`
              : `${est.days} ${plPlural(est.days, dayForms)}`}
          </p>
        </Card>

        <p className="px-1 text-xs text-ink-muted">
          Zasięg szacowany na podstawie przebiegu i średniej liczby kontaktów wzrokowych (OTS) na
          trasach miejskich i tranzytowych. Zakres ±30%.
        </p>

        <Button variant="cta" full onClick={onOrder}>
          Zamawiam
        </Button>
      </motion.div>
    </div>
  )
}
