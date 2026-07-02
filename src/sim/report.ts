import { routeById } from '../data/routes'
import { campaignStatus } from '../domain/campaign'
import { parseISODate } from '../domain/dates'
import { impressionsPerKm } from '../domain/estimator'
import { ESTIMATE_SPREAD } from '../domain/constants'
import type { Campaign, CampaignStatus, Truck } from '../domain/types'
import { kmInInterval } from './schedule'
import { truckParams } from './simulator'

const DAY_MS = 24 * 60 * 60 * 1000

export interface CampaignReport {
  status: CampaignStatus
  /** Доля прошедшего времени кампании 0..1. */
  progress: number
  /** Фактический пробег фур кампании к моменту now (км). */
  km: number
  impressions: number
  impressionsMin: number
  impressionsMax: number
  countries: string[]
  cities: string[]
  /** Кол-во фур кампании, чей маршрут проходит через страну (для SVG-баров). */
  countryStats: { code: string; trucks: number }[]
}

/**
 * Отчёт активной/прошедшей кампании: фактический км через kmInInterval по её
 * фурам (без дрейфа), показы = Σ км_фуры × OTS маршрута, покрытие — объединение
 * стран/городов. now передаётся явно (тестируемость).
 */
export function campaignReport(campaign: Campaign, trucks: Truck[], nowMs: number): CampaignReport {
  const byId = new Map(trucks.map((t) => [t.id, t]))
  const startMs = parseISODate(campaign.startDate).getTime()
  const endMs = parseISODate(campaign.endDate).getTime() + DAY_MS // конец включительно
  const untilMs = Math.min(nowMs, endMs)

  let km = 0
  let impressions = 0
  const countries = new Set<string>()
  const cities = new Set<string>()
  const countryTrucks = new Map<string, number>()

  for (const id of campaign.truckIds) {
    const truck = byId.get(id)
    if (!truck) continue
    const route = routeById(truck.routeId)
    if (!route) continue
    if (untilMs > startMs) {
      const d = kmInInterval(startMs, untilMs, truckParams(truck.id).speedFactor)
      km += d
      impressions += d * impressionsPerKm(route.urbanShare)
    }
    for (const c of route.countries) {
      countries.add(c)
      countryTrucks.set(c, (countryTrucks.get(c) ?? 0) + 1)
    }
    for (const c of route.cities) cities.add(c)
  }

  const progress =
    endMs > startMs ? Math.min(Math.max((nowMs - startMs) / (endMs - startMs), 0), 1) : 0

  return {
    status: campaignStatus(campaign, new Date(nowMs)),
    progress,
    km: Math.round(km),
    impressions: Math.round(impressions),
    impressionsMin: Math.round(impressions * (1 - ESTIMATE_SPREAD)),
    impressionsMax: Math.round(impressions * (1 + ESTIMATE_SPREAD)),
    countries: [...countries],
    cities: [...cities],
    countryStats: [...countryTrucks.entries()]
      .map(([code, t]) => ({ code, trucks: t }))
      .sort((a, b) => b.trucks - a.trucks),
  }
}
