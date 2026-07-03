import { describe, expect, it } from 'vitest'
import { ROUTES } from '../data/routes'
import type { Truck } from '../domain/types'
import { generateFleet } from './fleet'
import { cityHeatFeatures } from './reach'

const FLEET = generateFleet(ROUTES)

describe('cityHeatFeatures', () => {
  it('детерминирована; веса в (0,1] с максимумом 1', () => {
    const a = cityHeatFeatures(FLEET)
    const b = cityHeatFeatures(FLEET)
    expect(a.features.length).toBe(b.features.length)
    expect(a.features.length).toBeGreaterThan(0)
    const weights = a.features.map((f) => f.properties!.weight as number)
    expect(Math.min(...weights)).toBeGreaterThan(0)
    expect(Math.max(...weights)).toBeCloseTo(1, 5)
  })

  it('резолвит алиас Köln → Kolonia', () => {
    const r = ROUTES.find((rt) => rt.cities.includes('Köln'))
    if (!r) return
    const truck: Truck = { id: 'k1', plate: 'X', carrierId: 'c', routeId: r.id }
    const names = cityHeatFeatures([truck]).features.map((f) => f.properties!.name)
    expect(names).toContain('Kolonia')
    expect(names).not.toContain('Köln')
  })
})
