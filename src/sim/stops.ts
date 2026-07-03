import { CITIES } from '../data/cities'
import type { Route, Truck } from '../domain/types'
import type { LngLat } from './geo'
import { odometerKm } from './schedule'
import { pingPongDistance, routeGeometry, truckParams } from './simulator'

// В маршрутах встречается «Köln», в CITIES — польское «Kolonia».
const ALIAS: Record<string, string> = { Köln: 'Kolonia' }
const cityByName = new Map(CITIES.map((c) => [c.name, c]))
function cityCoord(name: string): LngLat | null {
  const c = cityByName.get(name) ?? cityByName.get(ALIAS[name] ?? '')
  return c ? [c.lng, c.lat] : null
}

export interface CityStop {
  name: string
  /** км от начала маршрута до ближайшей к городу вершины полилинии */
  cumKm: number
  lng: number
  lat: number
}

const stopsCache = new Map<string, CityStop[]>()

/** Города маршрута с дистанцией вдоль полилинии (монотонно от from к to). Мемоизировано. */
export function routeCityStops(route: Route): CityStop[] {
  const cached = stopsCache.get(route.id)
  if (cached) return cached
  const { points, cum } = routeGeometry(route)
  const stops: CityStop[] = []
  for (const name of route.cities) {
    const coord = cityCoord(name)
    if (!coord) continue
    let idx = 0
    let best = Infinity
    for (let i = 0; i < points.length; i++) {
      const dd = (points[i][0] - coord[0]) ** 2 + (points[i][1] - coord[1]) ** 2
      if (dd < best) { best = dd; idx = i }
    }
    stops.push({ name, cumKm: cum[idx], lng: coord[0], lat: coord[1] })
  }
  stops.sort((a, b) => a.cumKm - b.cumKm)
  stopsCache.set(route.id, stops)
  return stops
}

export interface DistAlong {
  d: number
  forward: boolean
  frac: number
  totalKm: number
}

/** Дистанция фуры вдоль маршрута + направление (ранее дублировалось в TruckDetailSheet). */
export function truckDistanceAlong(nowMs: number, truck: Truck, route: Route): DistAlong {
  const geo = routeGeometry(route)
  const p = truckParams(truck.id)
  const odo = odometerKm(nowMs, p.speedFactor) + p.phase01 * 2 * geo.totalKm
  const withDir = p.direction === 1 ? odo + geo.totalKm : odo
  const { d, forward } = pingPongDistance(withDir, geo.totalKm)
  return { d, forward, frac: geo.totalKm ? d / geo.totalKm : 0, totalKm: geo.totalKm }
}

/** Инверсия монотонного одометра: сколько мс до преодоления distanceKm (учёт окон/ночей/вс). */
export function etaMsForDistance(nowMs: number, speedFactor: number, distanceKm: number): number | null {
  if (distanceKm <= 0.5) return 0
  const target = odometerKm(nowMs, speedFactor) + distanceKm
  const DAY = 24 * 60 * 60 * 1000
  let lo = nowMs
  let hi = nowMs + (Math.ceil(distanceKm / 300) + 1) * DAY
  if (odometerKm(hi, speedFactor) < target) return null
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2
    if (odometerKm(mid, speedFactor) < target) lo = mid
    else hi = mid
  }
  return Math.round(hi - nowMs)
}

export interface NextStop {
  city: string
  distanceKm: number
  etaMs: number | null
}

/** Следующий город по ходу движения фуры + ETA. */
export function nextStop(nowMs: number, truck: Truck, route: Route): NextStop | null {
  const stops = routeCityStops(route)
  if (stops.length === 0) return null
  const { d, forward } = truckDistanceAlong(nowMs, truck, route)
  let target: CityStop | undefined
  if (forward) {
    target = stops.find((s) => s.cumKm > d + 1) ?? stops[stops.length - 1]
  } else {
    for (let i = stops.length - 1; i >= 0; i--) {
      if (stops[i].cumKm < d - 1) { target = stops[i]; break }
    }
    target ??= stops[0]
  }
  const distanceKm = Math.max(Math.abs(target.cumKm - d), 0)
  const etaMs = etaMsForDistance(nowMs, truckParams(truck.id).speedFactor, distanceKm)
  return { city: target.name, distanceKm, etaMs }
}
