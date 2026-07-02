import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/StatusBadge'
import { campaignStatus } from '../domain/campaign'
import { formatDate, formatPln, plPlural } from '../i18n/format'
import { useTick } from '../hooks/useTick'
import { useCampaignStore } from '../store/campaign'

const naczepaForms = { one: 'naczepa', few: 'naczepy', many: 'naczep' }

export function Kampanie() {
  const campaigns = useCampaignStore((s) => s.campaigns)
  useTick(30_000) // статус зависит от дат — обновляем изредка
  const now = new Date()

  return (
    <div className="px-4 pt-12 pb-4">
      <h1 className="text-2xl font-bold">Twoje kampanie</h1>

      {campaigns.length === 0 ? (
        <Card className="mt-4 p-6 text-center">
          <p className="text-sm text-ink-muted">Nie masz jeszcze żadnej kampanii.</p>
          <Link to="/zamow" className="mt-4 inline-block">
            <Button variant="cta" className="px-6 py-2.5 text-sm">
              Zamów pierwszą kampanię
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {campaigns.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/kampanie/${c.id}`}>
                <Card className="p-4 transition-shadow hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {formatDate(c.startDate)} – {formatDate(c.endDate)}
                    </span>
                    <StatusBadge status={campaignStatus(c, now)} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-ink-muted">
                    <span>
                      {c.trucks} {plPlural(c.trucks, naczepaForms)}
                    </span>
                    <span className="font-semibold text-ink">{formatPln(c.budgetPln)}</span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
          <Link to="/zamow" className="block pt-2">
            <Button variant="secondary" full>
              Nowa kampania
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
