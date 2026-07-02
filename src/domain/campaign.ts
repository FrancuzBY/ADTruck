import { parseISODate } from './dates'
import type { Campaign, CampaignStatus } from './types'

const DAY_MS = 24 * 60 * 60 * 1000

/** Статус выводится из дат, а не хранится — не бывает рассинхрона. Конец — включительно. */
export function campaignStatus(campaign: Campaign, now: Date): CampaignStatus {
  const t = now.getTime()
  if (t < parseISODate(campaign.startDate).getTime()) return 'scheduled'
  if (t >= parseISODate(campaign.endDate).getTime() + DAY_MS) return 'finished'
  return 'active'
}
