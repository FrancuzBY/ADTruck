import { pl } from '../i18n/pl'

export function Flota() {
  return (
    <div className="px-4 pt-12">
      <h1 className="text-2xl font-bold">{pl.flota.title}</h1>
      <div className="mt-4 rounded-card bg-surface p-5 text-sm text-ink-muted shadow-card">
        {pl.flota.placeholder}
      </div>
    </div>
  )
}
