import { describe, expect, it } from 'vitest'
import type { Route } from '../domain/types'
import { encodePolyline5 } from './geo'
import { CARRIERS, FLEET_SIZE, generateFleet } from './fleet'

const routes: Route[] = [
  {
    id: 'r1',
    name: 'A – B',
    from: 'A',
    to: 'B',
    countries: ['PL'],
    cities: [],
    lengthKm: 100,
    urbanShare: 0.2,
    polyline: encodePolyline5([
      [13, 52],
      [14, 52],
    ]),
  },
  {
    id: 'r2',
    name: 'C – D',
    from: 'C',
    to: 'D',
    countries: ['PL', 'DE'],
    cities: [],
    lengthKm: 200,
    urbanShare: 0.3,
    polyline: encodePolyline5([
      [15, 50],
      [16, 51],
    ]),
  },
]

describe('generateFleet', () => {
  it('ровно 120 фур, детерминированно', () => {
    const fleet1 = generateFleet(routes)
    const fleet2 = generateFleet(routes)
    expect(fleet1).toHaveLength(FLEET_SIZE)
    expect(fleet1).toEqual(fleet2)
  })

  it('«наш» перевозчик владеет первыми 12 бортами', () => {
    const fleet = generateFleet(routes)
    const mine = fleet.filter((t) => t.carrierId === CARRIERS[0].id)
    expect(mine).toHaveLength(12)
    expect(CARRIERS[0].isMine).toBe(true)
    expect(mine[0].plate.startsWith('WA ')).toBe(true)
  })

  it('маршруты и номера валидны', () => {
    const fleet = generateFleet(routes)
    const routeIds = new Set(routes.map((r) => r.id))
    for (const t of fleet) {
      expect(routeIds.has(t.routeId)).toBe(true)
      expect(t.plate).toMatch(/^[A-Z]{2} \d{5}$/)
    }
    // обе трассы реально используются
    expect(new Set(fleet.map((t) => t.routeId)).size).toBe(2)
  })
})
