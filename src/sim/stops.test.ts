import { describe, expect, it } from 'vitest'
import { ROUTES } from '../data/routes'
import type { Truck } from '../domain/types'
import { odometerKm } from './schedule'
import { etaMsForDistance, nextStop, routeCityStops, truckDistanceAlong } from './stops'

const NOW = Date.UTC(2026, 4, 15, 9, 0) // будний день, окно вождения
const truck = (routeId: string): Truck => ({ id: 'test-truck-1', plate: 'WA 00001', carrierId: 'c0', routeId })

describe('routeCityStops', () => {
  it('непустой и монотонный по cumKm', () => {
    const stops = routeCityStops(ROUTES[0])
    expect(stops.length).toBeGreaterThan(0)
    for (let i = 1; i < stops.length; i++) {
      expect(stops[i].cumKm).toBeGreaterThanOrEqual(stops[i - 1].cumKm)
    }
  })
})

describe('etaMsForDistance', () => {
  it('обратна odometerKm в пределах допуска', () => {
    const D = 200
    const eta = etaMsForDistance(NOW, 1, D)
    expect(eta).not.toBeNull()
    const covered = odometerKm(NOW + eta!, 1) - odometerKm(NOW, 1)
    expect(Math.abs(covered - D)).toBeLessThan(2)
    expect(eta!).toBeGreaterThan(0)
  })

  it('0 для нулевой дистанции', () => {
    expect(etaMsForDistance(NOW, 1, 0)).toBe(0)
  })
})

describe('nextStop', () => {
  it('даёт город + неотрицательные distance/ETA', () => {
    const route = ROUTES[0]
    const ns = nextStop(NOW, truck(route.id), route)
    expect(ns).not.toBeNull()
    expect(typeof ns!.city).toBe('string')
    expect(ns!.distanceKm).toBeGreaterThanOrEqual(0)
    if (ns!.etaMs !== null) expect(ns!.etaMs).toBeGreaterThanOrEqual(0)
  })
})

describe('truckDistanceAlong', () => {
  it('frac в диапазоне [0,1]', () => {
    const route = ROUTES[0]
    const da = truckDistanceAlong(NOW, truck(route.id), route)
    expect(da.frac).toBeGreaterThanOrEqual(0)
    expect(da.frac).toBeLessThanOrEqual(1)
  })
})
