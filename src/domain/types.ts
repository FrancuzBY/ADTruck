/** Дорожный коридор из routes.json (готовится dev-скриптом scripts/fetch-routes.mjs). */
export interface Route {
  id: string
  /** «Warszawa – Berlin» */
  name: string
  from: string
  to: string
  /** ISO-3166 alpha-2, по порядку прохождения, PL первым */
  countries: string[]
  /** Крупные города на маршруте (для «pokrycie kampanii») */
  cities: string[]
  lengthKm: number
  /** Доля «городских» километров 0..1 — входит в оценку показов */
  urbanShare: number
  /** Encoded polyline, precision 5 */
  polyline: string
}

export interface Carrier {
  id: string
  name: string
  /** Автопарк текущего пользователя в роли przewoźnik */
  isMine: boolean
}

export interface Truck {
  id: string
  plate: string
  carrierId: string
  routeId: string
  /** Добавлена пользователем через /flota/dodaj (вливается в общий пайплайн симулятора) */
  addedByUser?: boolean
}

export type CampaignStatus = 'scheduled' | 'active' | 'finished'

export interface Campaign {
  id: string
  /** epoch ms */
  createdAt: number
  /** ISO YYYY-MM-DD, включительно */
  startDate: string
  /** ISO YYYY-MM-DD, включительно */
  endDate: string
  trucks: number
  budgetPln: number
  /** Фуры, закреплённые за кампанией при создании */
  truckIds: string[]
  creativeUrl?: string
}

/** Прогноз кампании — результат оценщика (см. estimator.ts). */
export interface CampaignEstimate {
  days: number
  /** Может быть дробным для «неровных» диапазонов дат (см. campaignMonths) */
  months: number
  totalKm: number
  impressionsMid: number
  impressionsMin: number
  impressionsMax: number
  pricePln: number
}
