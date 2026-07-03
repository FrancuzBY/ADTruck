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
  const durationStr =
    wholeMonths !== null
      ? `${wholeMonths} ${plPlural(wholeMonths, monthForms)}`
      : `${est.days} ${plPlural(est.days, dayForms)}`

  const onOrder = () => {
    const campaign = createCampaign()
    navigate('/zamow/potwierdzenie', { state: { id: campaign.id } })
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-white to-canvas">
      <TopBar title="Podsumowanie" step={2} />
      <motion.div
        className="space-y-3 px-5 pb-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="px-5 py-1.5">
          <StatRow label="Czas trwania" value={durationStr} />
          <StatRow label="Liczba naczep" value={`${draft.trucks} ${plPlural(draft.trucks, naczepaForms)}`} />
          <StatRow label="Szacowany przebieg" value={`${formatNumber(km)} km`} />
          <StatRow label="Zasięg (wyświetlenia)" value={formatMlnRange(est.impressionsMin, est.impressionsMax)} />
        </Card>

        <div className="rounded-card border border-[#bbe5c8] bg-gradient-to-br from-[#eaf7ee] to-[#daf1e2] p-[22px] shadow-[0_14px_34px_-20px_rgb(22_163_74_/_0.4)]">
          <div className="font-mono text-xs font-semibold tracking-[0.1em] text-cta-strong uppercase">
            Koszt kampanii
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-[44px] leading-none font-extrabold tracking-tight tabular-nums text-cta-strong">
              {formatNumber(price)}
            </span>
            <span className="font-display text-[26px] font-bold text-cta-strong">zł</span>
          </div>
          <div className="mt-2 font-mono text-[12.5px] text-[#3f8f5b]">
            {draft.trucks} × {formatPln(3000)} × {durationStr}
          </div>
        </div>

        <p className="px-0.5 pt-1 text-xs leading-relaxed text-ink-faint">
          Zasięg szacowany na podstawie przebiegu i średniej liczby kontaktów wzrokowych (OTS) na
          trasach miejskich i tranzytowych. Zakres ±30%.
        </p>

        <div className="pt-1">
          <Button variant="cta" full onClick={onOrder}>
            Zamawiam
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
