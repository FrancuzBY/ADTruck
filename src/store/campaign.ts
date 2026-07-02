import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Campaign } from '../domain/types'
import { BASE_FLEET } from './fleet'
import { STORAGE_PREFIX } from './app'

export interface CampaignDraft {
  startDate: string
  endDate: string
  trucks: number
  budgetPln: number
}

/** Дефолт визарда — фикстура мокапа (даёт ровно 450 000 zł на экране сводки). */
const DEFAULT_DRAFT: CampaignDraft = {
  startDate: '2026-05-01',
  endDate: '2026-07-31',
  trucks: 50,
  budgetPln: 150_000,
}

interface CampaignState {
  draft: CampaignDraft
  campaigns: Campaign[]
  setDraft: (patch: Partial<CampaignDraft>) => void
  resetDraft: () => void
  createCampaign: () => Campaign
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      draft: DEFAULT_DRAFT,
      campaigns: [],
      setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      resetDraft: () => set({ draft: DEFAULT_DRAFT }),
      createCampaign: () => {
        const d = get().draft
        const campaign: Campaign = {
          id: crypto.randomUUID().slice(0, 8),
          createdAt: Date.now(),
          startDate: d.startDate,
          endDate: d.endDate,
          trucks: d.trucks,
          budgetPln: d.budgetPln,
          // Детерминированно закрепляем N бортов за кампанией (для отчёта в M6).
          truckIds: BASE_FLEET.slice(0, d.trucks).map((t) => t.id),
        }
        set((s) => ({ campaigns: [campaign, ...s.campaigns] }))
        return campaign
      },
    }),
    { name: `${STORAGE_PREFIX}:campaign`, partialize: (s) => ({ campaigns: s.campaigns }) },
  ),
)
