import type { CampaignStatus } from '../../domain/types'

const LIGHT: Record<CampaignStatus, { label: string; cls: string }> = {
  scheduled: { label: 'Zaplanowana', cls: 'bg-amber-100 text-amber-700' },
  active: { label: 'Aktywna', cls: 'bg-cta/12 text-cta-strong' },
  finished: { label: 'Zakończona', cls: 'bg-slate-100 text-slate-500' },
}

const DARK: Record<CampaignStatus, { label: string; cls: string }> = {
  scheduled: { label: 'Zaplanowana', cls: 'bg-amber-400/15 text-amber-300' },
  active: { label: 'Aktywna', cls: 'bg-live/15 text-live' },
  finished: { label: 'Zakończona', cls: 'bg-white/10 text-slate-400' },
}

export function StatusBadge({ status, dark }: { status: CampaignStatus; dark?: boolean }) {
  const s = (dark ? DARK : LIGHT)[status]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  )
}
