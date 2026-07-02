import {
  DEFAULT_URBAN_SHARE,
  ESTIMATE_SPREAD,
  KM_PER_TRUCK_MONTH,
  OTS_PER_KM_HIGHWAY,
  OTS_PER_KM_URBAN,
  PRICE_PER_TRUCK_MONTH_PLN,
} from './constants'
import { campaignMonths, daysInclusive } from './dates'
import type { CampaignEstimate } from './types'

export interface EstimateInput {
  /** ISO YYYY-MM-DD, включительно */
  startDate: string
  /** ISO YYYY-MM-DD, включительно */
  endDate: string
  trucks: number
  /** Доля городских км 0..1; по умолчанию DEFAULT_URBAN_SHARE */
  urbanShare?: number
}

/** Показов на километр: линейная смесь трассового и городского OTS. */
export function impressionsPerKm(urbanShare: number): number {
  return OTS_PER_KM_HIGHWAY * (1 - urbanShare) + OTS_PER_KM_URBAN * urbanShare
}

/** Прогноз кампании: пробег, диапазон показов ±30%, стоимость. */
export function estimateCampaign(input: EstimateInput): CampaignEstimate {
  const { startDate, endDate, trucks } = input
  const urbanShare = input.urbanShare ?? DEFAULT_URBAN_SHARE
  const months = campaignMonths(startDate, endDate)
  const totalKm = Math.round(trucks * KM_PER_TRUCK_MONTH * months)
  const impressionsMid = Math.round(totalKm * impressionsPerKm(urbanShare))
  return {
    days: daysInclusive(startDate, endDate),
    months,
    totalKm,
    impressionsMid,
    impressionsMin: Math.round(impressionsMid * (1 - ESTIMATE_SPREAD)),
    impressionsMax: Math.round(impressionsMid * (1 + ESTIMATE_SPREAD)),
    pricePln: Math.round(trucks * PRICE_PER_TRUCK_MONTH_PLN * months),
  }
}

/** Подсказка слайдера бюджета: «Przy tym budżecie: do N naczep» (бюджет — за месяц). */
export function trucksForBudget(budgetPln: number): number {
  return Math.floor(budgetPln / PRICE_PER_TRUCK_MONTH_PLN)
}
