import { Link } from 'react-router'
import { pl } from '../i18n/pl'

export function ZamowPotwierdzenie() {
  return (
    <div className="px-4 pt-12">
      <h1 className="text-2xl font-bold">{pl.zamow.confirmTitle}</h1>
      <div className="mt-4 rounded-card bg-surface p-5 shadow-card">
        <p className="text-base font-semibold text-cta-strong">{pl.zamow.confirmed}</p>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <Link to="/mapa" className="font-medium text-brand hover:underline">
            {pl.zamow.goToMap} →
          </Link>
          <Link to="/kampanie" className="font-medium text-brand hover:underline">
            {pl.zamow.goToCampaigns} →
          </Link>
        </div>
      </div>
    </div>
  )
}
