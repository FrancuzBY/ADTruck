import { describe, expect, it } from 'vitest'
import type { Campaign } from '../domain/types'
import { BASE_FLEET } from '../store/fleet'
import { campaignReport } from './report'

const campaign: Campaign = {
  id: 'test1',
  createdAt: 0,
  startDate: '2026-05-01',
  endDate: '2026-07-31',
  trucks: 50,
  budgetPln: 150_000,
  truckIds: BASE_FLEET.slice(0, 50).map((t) => t.id),
}

const START = Date.UTC(2026, 4, 1)
const MID = Date.UTC(2026, 5, 15) // середина кампании
const AFTER = Date.UTC(2026, 8, 1) // после окончания

describe('campaignReport', () => {
  it('на старте пробег нулевой, статус active/scheduled', () => {
    const r = campaignReport(campaign, BASE_FLEET, START)
    expect(r.km).toBe(0)
    expect(r.progress).toBeCloseTo(0, 5)
  })

  it('в середине — пробег растёт, показы > 0, покрытие непустое', () => {
    const r = campaignReport(campaign, BASE_FLEET, MID)
    expect(r.km).toBeGreaterThan(0)
    expect(r.impressions).toBeGreaterThan(0)
    expect(r.impressionsMin).toBeLessThan(r.impressions)
    expect(r.impressionsMax).toBeGreaterThan(r.impressions)
    expect(r.countries).toContain('PL')
    expect(r.countryStats.length).toBeGreaterThan(0)
    expect(r.progress).toBeGreaterThan(0)
    expect(r.progress).toBeLessThan(1)
  })

  it('после окончания — прогресс 100%, статус finished, км не растёт дальше конца', () => {
    const r = campaignReport(campaign, BASE_FLEET, AFTER)
    expect(r.status).toBe('finished')
    expect(r.progress).toBe(1)
    const atEnd = campaignReport(campaign, BASE_FLEET, Date.UTC(2026, 7, 1)) // ровно конец (31.07 + 1 день)
    expect(r.km).toBe(atEnd.km) // после конца пробег заморожен
  })

  it('countryStats отсортированы по убыванию числа фур', () => {
    const r = campaignReport(campaign, BASE_FLEET, MID)
    for (let i = 1; i < r.countryStats.length; i++) {
      expect(r.countryStats[i - 1].trucks).toBeGreaterThanOrEqual(r.countryStats[i].trucks)
    }
  })
})
