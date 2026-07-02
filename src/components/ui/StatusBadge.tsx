import type { CampaignStatus } from '../../domain/types'

const STATUS: Record<CampaignStatus, { label: string; cls: string }> = {
  scheduled: { label: 'Zaplanowana', cls: 'bg-amber-100 text-amber-700' },
  active: { label: 'Aktywna', cls: 'bg-cta/12 text-cta-strong' },
  finished: { label: 'Zakończona', cls: 'bg-slate-100 text-slate-500' },
}

export function StatusBadge({ status }: { status: CampaignStatus }) {
  const s = STATUS[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  )
}
