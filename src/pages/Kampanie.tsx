import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { StatusBadge } from '../components/ui/StatusBadge'
import { campaignStatus } from '../domain/campaign'
import { formatDate, formatPln, plPlural } from '../i18n/format'
import { useTick } from '../hooks/useTick'
import { useCampaignStore } from '../store/campaign'

const naczepaForms = { one: 'naczepa', few: 'naczepy', many: 'naczep' }

export function Kampanie() {
  const campaigns = useCampaignStore((s) => s.campaigns)
  useTick(30_000)
  const now = new Date()

  return (
    <div className="min-h-full bg-canvas px-5 pt-[76px] pb-4">
      <h1 className="font-display text-[31px] font-extrabold tracking-tight text-ink">Twoje kampanie</h1>

      {campaigns.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="grid size-[66px] place-items-center rounded-[20px] bg-brand-soft text-neon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-8">
              <path d="M3 11v3l3 .4v3.6l3 .5v-4l9 2V7l-9 2-3 .5H3Z" />
              <path d="M18 8.5a3 3 0 0 1 0 6" />
            </svg>
          </div>
          <p className="mt-5 max-w-60 text-base leading-snug text-ink-muted">
            Nie masz jeszcze żadnej kampanii.
          </p>
          <Link
            to="/zamow"
            className="mt-6 rounded-full bg-cta px-7 py-3.5 text-[15.5px] font-semibold text-white shadow-[0_12px_28px_-10px_rgb(22_163_74_/_0.5)] transition-colors hover:bg-cta-strong"
          >
            Zamów pierwszą kampanię
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {campaigns.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/kampanie/${c.id}`}
                className="block rounded-[20px] border border-line bg-surface p-[18px] transition-colors hover:bg-surface-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[13px] text-ink-muted">
                    {formatDate(c.startDate)} – {formatDate(c.endDate)}
                  </span>
                  <StatusBadge status={campaignStatus(c, now)} dark />
                </div>
                <div className="mt-3.5 flex items-end justify-between">
                  <span className="text-sm text-ink-faint">
                    {c.trucks} {plPlural(c.trucks, naczepaForms)}
                  </span>
                  <span className="font-mono text-[21px] font-semibold tabular-nums text-ink">
                    {formatPln(c.budgetPln)}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
          <Link
            to="/zamow"
            className="mt-4 block w-full rounded-full border border-line bg-surface-2 py-4 text-center text-[15px] font-semibold text-ink transition-colors hover:bg-surface"
          >
            Nowa kampania
          </Link>
        </div>
      )}
    </div>
  )
}
