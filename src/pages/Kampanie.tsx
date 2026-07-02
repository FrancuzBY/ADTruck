import { Link } from 'react-router'
import { pl } from '../i18n/pl'

export function Kampanie() {
  return (
    <div className="px-4 pt-12">
      <h1 className="text-2xl font-bold">{pl.kampanie.title}</h1>
      <div className="mt-4 rounded-card bg-surface p-6 text-center shadow-card">
        <p className="text-sm text-ink-muted">{pl.kampanie.empty}</p>
        <Link
          to="/zamow"
          className="mt-4 inline-block rounded-full bg-cta px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cta-strong"
        >
          {pl.kampanie.emptyCta}
        </Link>
      </div>
    </div>
  )
}
