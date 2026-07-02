import { describe, expect, it } from 'vitest'
import { campaignMonths, daysInclusive } from './dates'
import { estimateCampaign, impressionsPerKm, trucksForBudget } from './estimator'

/** Опорная фикстура мокапа: 50 naczep, 01.05–31.07.2026 → 450 000 zł. */
const FIXTURE = { startDate: '2026-05-01', endDate: '2026-07-31', trucks: 50 }

describe('campaignMonths / daysInclusive', () => {
  it('вычисляет целые календарные месяцы для «ровных» диапазонов', () => {
    expect(campaignMonths('2026-05-01', '2026-07-31')).toBe(3)
    expect(campaignMonths('2026-05-01', '2026-05-31')).toBe(1)
    expect(campaignMonths('2026-05-15', '2026-06-14')).toBe(1)
    expect(campaignMonths('2026-01-01', '2026-12-31')).toBe(12)
  })

  it('для неровных диапазонов месяцы = days/30', () => {
    expect(campaignMonths('2026-05-01', '2026-05-10')).toBeCloseTo(10 / 30, 10)
    expect(campaignMonths('2026-05-01', '2026-06-15')).toBeCloseTo(46 / 30, 10)
  })

  it('считает дни включительно', () => {
    expect(daysInclusive('2026-05-01', '2026-07-31')).toBe(92)
    expect(daysInclusive('2026-05-01', '2026-05-01')).toBe(1)
  })
})

describe('estimateCampaign', () => {
  it('фикстура мокапа: 50 naczep × 3 mies. = 450 000 zł, 1,5 mln km', () => {
    const e = estimateCampaign(FIXTURE)
    expect(e.months).toBe(3)
    expect(e.days).toBe(92)
    expect(e.pricePln).toBe(450_000)
    expect(e.totalKm).toBe(1_500_000)
  })

  it('показы = км × смесь OTS, диапазон ±30%', () => {
    const e = estimateCampaign(FIXTURE) // DEFAULT_URBAN_SHARE = 0.25 → 4,5 показа/км
    expect(e.impressionsMid).toBe(6_750_000)
    expect(e.impressionsMin).toBe(4_725_000)
    expect(e.impressionsMax).toBe(8_775_000)
  })

  it('цена растёт монотонно по числу фур и длительности', () => {
    const base = estimateCampaign(FIXTURE).pricePln
    expect(estimateCampaign({ ...FIXTURE, trucks: 51 }).pricePln).toBeGreaterThan(base)
    expect(estimateCampaign({ ...FIXTURE, endDate: '2026-08-31' }).pricePln).toBeGreaterThan(base)
  })
})

describe('impressionsPerKm', () => {
  it('крайние значения смеси: 0 → трасса, 1 → город', () => {
    expect(impressionsPerKm(0)).toBe(3)
    expect(impressionsPerKm(1)).toBe(9)
    expect(impressionsPerKm(0.25)).toBe(4.5)
  })
})

describe('trucksForBudget', () => {
  it('N = floor(budżet / 3000)', () => {
    expect(trucksForBudget(150_000)).toBe(50)
    expect(trucksForBudget(30_000)).toBe(10)
    expect(trucksForBudget(400_000)).toBe(133)
    expect(trucksForBudget(2_999)).toBe(0)
  })
})
