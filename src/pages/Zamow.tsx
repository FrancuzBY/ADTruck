import { Link } from 'react-router'
import { pl } from '../i18n/pl'

export function Zamow() {
  return (
    <div className="px-4 pt-12">
      <h1 className="text-2xl font-bold">{pl.zamow.title}</h1>
      <div className="mt-4 rounded-card bg-surface p-5 text-sm text-ink-muted shadow-card">
        {pl.zamow.placeholder}
      </div>
      <Link
        to="/zamow/podsumowanie"
        className="mt-6 block rounded-full bg-cta py-3 text-center text-base font-semibold text-white transition-colors hover:bg-cta-strong"
      >
        {pl.zamow.next}
      </Link>
    </div>
  )
}
