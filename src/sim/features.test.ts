import { describe, expect, it } from 'vitest'
import { ROUTES } from '../data/routes'
import type { Truck } from '../domain/types'
import { BASE_FLEET } from '../store/fleet'
import { truckFeatures } from './features'

const T = Date.UTC(2026, 5, 30, 9, 0)

describe('truckFeatures', () => {
  it('строит FeatureCollection для всего базового флота (120 фур)', () => {
    const fc = truckFeatures(T, BASE_FLEET)
    expect(fc.type).toBe('FeatureCollection')
    expect(fc.features).toHaveLength(120)
  })

  it('каждая фича — валидная точка с полями попапа', () => {
    const fc = truckFeatures(T, BASE_FLEET.slice(0, 5))
    for (const f of fc.features) {
      expect(f.geometry.type).toBe('Point')
      const [lng, lat] = f.geometry.coordinates
      expect(lng).toBeGreaterThan(-10)
      expect(lng).toBeLessThan(30)
      expect(lat).toBeGreaterThan(35)
      expect(lat).toBeLessThan(60)
      expect(f.properties.plate).toMatch(/^[A-Z]{2} \d{5}$/)
      expect(f.properties.routeName).toContain('–')
      expect(f.properties.bearing).toBeGreaterThanOrEqual(0)
      expect(f.properties.bearing).toBeLessThanOrEqual(360)
    }
  })

  it('пропускает фуры с несуществующим маршрутом', () => {
    const bad: Truck = { id: 'x1', plate: 'WA 00000', carrierId: 'c-transpol', routeId: 'no-such' }
    const fc = truckFeatures(T, [bad])
    expect(fc.features).toHaveLength(0)
  })

  it('первые 12 фур помечены как «наши»', () => {
    const fc = truckFeatures(T, BASE_FLEET)
    const mine = fc.features.filter((f) => f.properties.mine)
    expect(mine).toHaveLength(12)
  })

  it('детерминизм: одинаковый вход → идентичный выход', () => {
    expect(truckFeatures(T, BASE_FLEET.slice(0, 10))).toEqual(
      truckFeatures(T, BASE_FLEET.slice(0, 10)),
    )
  })

  it('все маршруты флота есть в routes.json', () => {
    const ids = new Set(ROUTES.map((r) => r.id))
    for (const t of BASE_FLEET) expect(ids.has(t.routeId)).toBe(true)
  })
})
