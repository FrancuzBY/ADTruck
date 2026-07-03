import { describe, expect, it } from 'vitest'
import { ROUTES } from '../data/routes'
import type { Truck } from '../domain/types'
import { generateFleet } from './fleet'
import { reachHeatFeatures } from './reach'

const FLEET = generateFleet(ROUTES)

describe('reachHeatFeatures', () => {
  it('детерминирована; веса в (0,1]; есть коридоры и города', () => {
    const a = reachHeatFeatures(FLEET)
    const b = reachHeatFeatures(FLEET)
    expect(a.features.length).toBe(b.features.length)
    expect(a.features.length).toBeGreaterThan(50)
    const weights = a.features.map((f) => f.properties!.weight as number)
    expect(Math.min(...weights)).toBeGreaterThan(0)
    expect(Math.max(...weights)).toBeLessThanOrEqual(1)
    // есть именованные точки-города и безымянные точки-коридоры
    expect(a.features.some((f) => f.properties!.name)).toBe(true)
    expect(a.features.some((f) => !f.properties!.name)).toBe(true)
  })

  it('живой слой добавляет точки при nowMs', () => {
    const base = reachHeatFeatures(FLEET).features.length
    const live = reachHeatFeatures(FLEET, Date.UTC(2026, 4, 15, 9, 0)).features.length
    expect(live).toBeGreaterThan(base)
  })

  it('резолвит алиас Köln → Kolonia', () => {
    const r = ROUTES.find((rt) => rt.cities.includes('Köln'))
    if (!r) return
    const truck: Truck = { id: 'k1', plate: 'X', carrierId: 'c', routeId: r.id }
    const names = reachHeatFeatures([truck]).features.map((f) => f.properties!.name).filter(Boolean)
    expect(names).toContain('Kolonia')
    expect(names).not.toContain('Köln')
  })
})
