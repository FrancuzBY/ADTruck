import { CITIES } from '../data/cities'
import { routeById, ROUTES } from '../data/routes'
import type { Truck } from '../domain/types'
import { cumulativeKm, decodePolyline5, pointAtDistance, type LngLat } from './geo'
import { truckStateAt } from './simulator'

const ALIAS: Record<string, string> = { Köln: 'Kolonia' }
const cityByName = new Map(CITIES.map((c) => [c.name, c]))

/** Приблизительное население агломерации (млн) — вес «сколько глаз у дороги». */
const POP: Record<string, number> = {
  Warszawa: 3.1, Poznań: 1.0, Gdańsk: 1.5, Katowice: 2.7, Wrocław: 1.25, Łódź: 1.0,
  Kraków: 1.4, Szczecin: 0.7, Białystok: 0.4, Olsztyn: 0.2, Berlin: 4.5, Hamburg: 2.5,
  Hannover: 1.1, Drezno: 0.8, Frankfurt: 2.3, Kolonia: 3.0, Dortmund: 3.6, Duisburg: 0.5,
  Norymberga: 1.2, Erfurt: 0.2, Monachium: 2.6, Rotterdam: 1.0, Amsterdam: 1.6, Utrecht: 0.9,
  Antwerpia: 1.0, Liège: 0.6, Paryż: 11, Lyon: 1.7, Miluza: 0.3, Praga: 1.3, Brno: 0.4,
  Ostrawa: 0.3, Wiedeń: 1.9, Villach: 0.06, Bratysława: 0.65, Żylina: 0.08, Budapeszt: 1.75,
  Kowno: 0.3, Wilno: 0.58, Ryga: 0.6, Mediolan: 3.1, Saragossa: 0.7, Madryt: 6.6, Barcelona: 5.6,
}
const pop = (name: string) => POP[name] ?? 0.3
const MAX_POP = Math.max(...Object.values(POP))

const pt = (lng: number, lat: number, weight: number, name?: string): GeoJSON.Feature => ({
  type: 'Feature',
  properties: name ? { weight, name } : { weight },
  geometry: { type: 'Point', coordinates: [lng, lat] },
})

/**
 * Тепловая карта охвата = «где рекламу видит больше людей».
 * Модель (честный прокси, без внешних данных о трафике):
 *   • коридоры: точки вдоль полилиний, вес = плотность нашего флота на дороге × городская доля;
 *   • города: вес = сколько фур проходит × население агломерации (крупные = ярче);
 *   • живой слой (если задан nowMs): текущие позиции флота — «трафик прямо сейчас».
 */
export function reachHeatFeatures(trucks: Truck[], nowMs?: number): GeoJSON.FeatureCollection {
  // Плотность флота по маршрутам и городам.
  const routeCount = new Map<string, number>()
  const cityCount = new Map<string, number>()
  for (const t of trucks) {
    const route = routeById(t.routeId)
    if (!route) continue
    routeCount.set(t.routeId, (routeCount.get(t.routeId) ?? 0) + 1)
    for (const name of route.cities) {
      const key = ALIAS[name] ?? name
      cityCount.set(key, (cityCount.get(key) ?? 0) + 1)
    }
  }
  const maxRoute = Math.max(1, ...routeCount.values())
  const maxCity = Math.max(1, ...cityCount.values())

  const features: GeoJSON.Feature[] = []

  // Коридоры — точки вдоль дорог каждые ~28 км.
  const STEP_KM = 28
  for (const route of ROUTES) {
    const n = routeCount.get(route.id) ?? 0
    if (n === 0) continue
    const geo = routeGeometryCum(route.polyline)
    if (!geo) continue
    const w = (0.1 + 0.2 * (n / maxRoute)) * (0.8 + 0.4 * route.urbanShare)
    for (let d = 0; d <= geo.total; d += STEP_KM) {
      const p = pointAt(geo, d)
      features.push(pt(p[0], p[1], w))
    }
  }

  // Города — ядра по населению × плотности флота.
  for (const [name, count] of cityCount) {
    const c = cityByName.get(name)
    if (!c) continue
    const weight = 0.5 + 0.5 * (0.5 * (count / maxCity) + 0.5 * (pop(name) / MAX_POP))
    features.push(pt(c.lng, c.lat, weight, name))
  }

  // Живой слой — где флот прямо сейчас.
  if (nowMs !== undefined) {
    for (const t of trucks) {
      const route = routeById(t.routeId)
      if (!route) continue
      const s = truckStateAt(nowMs, t, route)
      features.push(pt(s.lng, s.lat, 0.3))
    }
  }

  return { type: 'FeatureCollection', features }
}

// Лёгкая геометрия для сэмплинга (свой кэш по polyline).
interface Cum { points: LngLat[]; cum: number[]; total: number }
const cumCache = new Map<string, Cum>()
function routeGeometryCum(polyline: string): Cum | null {
  let g = cumCache.get(polyline)
  if (!g) {
    const points = decodePolyline5(polyline)
    if (points.length < 2) return null
    const cum = cumulativeKm(points)
    g = { points, cum, total: cum[cum.length - 1] }
    cumCache.set(polyline, g)
  }
  return g
}
function pointAt(g: Cum, d: number): LngLat {
  const p = pointAtDistance(g.points, g.cum, d)
  return [p.lng, p.lat]
}
