import { CARRIERS } from './fleet'
import { routeById } from '../data/routes'
import type { Route, Truck } from '../domain/types'
import { truckStateAt } from './simulator'

/** GeoJSON Feature фуры со всеми полями для символьного слоя и попапа. */
export interface TruckFeature {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    id: string
    plate: string
    routeName: string
    carrier: string
    bearing: number
    isDriving: boolean
    speedKmh: number
    kmToday: number
    mine: boolean
  }
}

export interface TruckFeatureCollection {
  type: 'FeatureCollection'
  features: TruckFeature[]
}

const carrierName = (id: string) => CARRIERS.find((c) => c.id === id)?.name ?? id
const isMine = (id: string) => CARRIERS.find((c) => c.id === id)?.isMine ?? false

/** Состояние одной фуры → Feature (маршрут ищется по routeId). */
export function truckFeatureAt(simTimeMs: number, truck: Truck, route: Route): TruckFeature {
  const s = truckStateAt(simTimeMs, truck, route)
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
    properties: {
      id: truck.id,
      plate: truck.plate,
      routeName: route.name,
      carrier: carrierName(truck.carrierId),
      bearing: Math.round(s.bearing),
      isDriving: s.isDriving,
      speedKmh: s.speedKmh,
      kmToday: Math.round(s.kmToday),
      mine: isMine(truck.carrierId),
    },
  }
}

/** Весь флот → FeatureCollection на момент simTimeMs. Чистая функция. */
export function truckFeatures(simTimeMs: number, trucks: Truck[]): TruckFeatureCollection {
  const features: TruckFeature[] = []
  for (const truck of trucks) {
    const route = routeById(truck.routeId)
    if (route) features.push(truckFeatureAt(simTimeMs, truck, route))
  }
  return { type: 'FeatureCollection', features }
}
