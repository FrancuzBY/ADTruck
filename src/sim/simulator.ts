import type { Route, Truck } from '../domain/types'
import { cumulativeKm, decodePolyline5, pointAtDistance, type LngLat } from './geo'
import { hashStringToSeed, mulberry32 } from './rng'
import { BASE_SPEED_KMH, isDrivingAt, kmInInterval, odometerKm, startOfUTCDay } from './schedule'

/** Все симуляторные параметры фуры детерминированно выводятся из её id. */
export interface TruckSimParams {
  /** Стартовое направление по маршруту */
  direction: 0 | 1
  /** Фаза на цикле туда-обратно, доля 0..1 от 2L */
  phase01: number
  /** Разброс скорости 0.9–1.1 */
  speedFactor: number
}

/** Порядок draws из mulberry32 — контракт детерминизма, не менять. */
export function truckParams(truckId: string): TruckSimParams {
  const rng = mulberry32(hashStringToSeed(truckId))
  const direction = rng() < 0.5 ? 0 : 1
  const phase01 = rng()
  const speedFactor = 0.9 + rng() * 0.2
  return { direction, phase01, speedFactor }
}

export interface RouteGeometry {
  points: LngLat[]
  cum: number[]
  totalKm: number
}

const geometryCache = new Map<string, RouteGeometry>()

/** Декод polyline + кумулятивные дистанции, мемоизировано по route.id. */
export function routeGeometry(route: Route): RouteGeometry {
  let geo = geometryCache.get(route.id)
  if (!geo) {
    const points = decodePolyline5(route.polyline)
    const cum = cumulativeKm(points)
    geo = { points, cum, totalKm: cum[cum.length - 1] }
    geometryCache.set(route.id, geo)
  }
  return geo
}

/** Позиция на ping-pong цикле: одометр d по циклу длиной 2L → точка маршрута и направление. */
export function pingPongDistance(odoKm: number, totalKm: number): { d: number; forward: boolean } {
  const cycle = ((odoKm % (2 * totalKm)) + 2 * totalKm) % (2 * totalKm)
  return cycle <= totalKm ? { d: cycle, forward: true } : { d: 2 * totalKm - cycle, forward: false }
}

export interface TruckState {
  lng: number
  lat: number
  /** Азимут движения с учётом направления по маршруту */
  bearing: number
  isDriving: boolean
  /** км с начала UTC-суток («km dzisiaj») */
  kmToday: number
  /** Мгновенная скорость: 0 на паузе/отдыхе */
  speedKmh: number
}

/** Состояние фуры в момент simTimeMs — чистая функция (wall-clock, truck.id, маршрут). */
export function truckStateAt(simTimeMs: number, truck: Truck, route: Route): TruckState {
  const params = truckParams(truck.id)
  const geo = routeGeometry(route)
  const odo = odometerKm(simTimeMs, params.speedFactor) + params.phase01 * 2 * geo.totalKm
  const withDirection = params.direction === 1 ? odo + geo.totalKm : odo
  const { d, forward } = pingPongDistance(withDirection, geo.totalKm)
  const point = pointAtDistance(geo.points, geo.cum, d)
  const isDriving = isDrivingAt(simTimeMs)
  return {
    lng: point.lng,
    lat: point.lat,
    bearing: forward ? point.bearing : (point.bearing + 180) % 360,
    isDriving,
    kmToday: kmInInterval(startOfUTCDay(simTimeMs), simTimeMs, params.speedFactor),
    speedKmh: isDriving ? Math.round(BASE_SPEED_KMH * params.speedFactor) : 0,
  }
}
