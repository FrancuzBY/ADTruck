import { CITIES } from '../data/cities'
import { routeById } from '../data/routes'
import { impressionsPerKm } from '../domain/estimator'
import type { Truck } from '../domain/types'

const ALIAS: Record<string, string> = { Köln: 'Kolonia' }
const cityByName = new Map(CITIES.map((c) => [c.name, c]))

/**
 * Точки городов с нормированным весом «плотности охвата» (0..1) для heatmap-слоя.
 * Вес = Σ по фурам, чей маршрут проходит город, от OTS маршрута (impressionsPerKm).
 * Это прокси плотности контактов, не «показы на город» (их в модели нет).
 */
export function cityHeatFeatures(trucks: Truck[]): GeoJSON.FeatureCollection {
  const weight = new Map<string, number>()
  for (const t of trucks) {
    const route = routeById(t.routeId)
    if (!route) continue
    const w = impressionsPerKm(route.urbanShare)
    for (const name of route.cities) {
      const key = ALIAS[name] ?? name
      weight.set(key, (weight.get(key) ?? 0) + w)
    }
  }
  let max = 0
  for (const w of weight.values()) if (w > max) max = w
  const features: GeoJSON.Feature[] = []
  for (const [name, w] of weight) {
    const c = cityByName.get(name)
    if (!c) continue
    features.push({
      type: 'Feature',
      properties: { name, weight: max ? w / max : 0 },
      geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
    })
  }
  return { type: 'FeatureCollection', features }
}
