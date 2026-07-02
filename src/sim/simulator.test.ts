import { describe, expect, it } from 'vitest'
import type { Route, Truck } from '../domain/types'
import { encodePolyline5, type LngLat } from './geo'
import { hashStringToSeed, mulberry32 } from './rng'
import { pingPongDistance, routeGeometry, truckParams, truckStateAt } from './simulator'

/** Прямая «трасса» ~344 км вдоль 52-й широты. */
const FIXTURE_POINTS: LngLat[] = [
  [13, 52],
  [14, 52],
  [15, 52],
  [16, 52],
  [17, 52],
  [18, 52],
]
const FIXTURE_ROUTE: Route = {
  id: 'fx-1',
  name: 'Fixture – Ost',
  from: 'A',
  to: 'B',
  countries: ['PL', 'DE'],
  cities: ['A', 'B'],
  lengthKm: 344,
  urbanShare: 0.2,
  polyline: encodePolyline5(FIXTURE_POINTS),
}
const TRUCK: Truck = { id: 't042', plate: 'WA 12345', carrierId: 'c-transpol', routeId: 'fx-1' }

/** Вторник 2026-06-30, 08:30 UTC — фуры в движении. */
const T_DRIVING = Date.UTC(2026, 5, 30, 8, 30)

describe('mulberry32 / hashStringToSeed', () => {
  it('стабильная последовательность для фиксированного seed (контракт)', () => {
    const rng = mulberry32(123456789)
    const seq = [rng(), rng(), rng()]
    expect(seq).toEqual([0.2577907438389957, 0.9707721115555614, 0.7853280142880976])
  })

  it('hash детерминирован и различает id', () => {
    expect(hashStringToSeed('t001')).toBe(hashStringToSeed('t001'))
    expect(hashStringToSeed('t001')).not.toBe(hashStringToSeed('t002'))
  })
})

describe('truckParams', () => {
  it('детерминированы и в допустимых диапазонах', () => {
    const p1 = truckParams('t042')
    const p2 = truckParams('t042')
    expect(p1).toEqual(p2)
    expect(p1.speedFactor).toBeGreaterThanOrEqual(0.9)
    expect(p1.speedFactor).toBeLessThanOrEqual(1.1)
    expect(p1.phase01).toBeGreaterThanOrEqual(0)
    expect(p1.phase01).toBeLessThan(1)
  })
})

describe('pingPongDistance', () => {
  const L = 100

  it('первая половина цикла — вперёд', () => {
    expect(pingPongDistance(30, L)).toEqual({ d: 30, forward: true })
    expect(pingPongDistance(100, L)).toEqual({ d: 100, forward: true })
  })

  it('вторая половина — разворот и движение назад', () => {
    expect(pingPongDistance(110, L)).toEqual({ d: 90, forward: false })
    expect(pingPongDistance(199, L)).toEqual({ d: 1, forward: false })
  })

  it('цикл замыкается: 2L + x ≡ x', () => {
    expect(pingPongDistance(205, L)).toEqual({ d: 5, forward: true })
  })
})

describe('truckStateAt', () => {
  it('чистая функция: повторный вызов с теми же входами — идентичное состояние («между сессиями»)', () => {
    const s1 = truckStateAt(T_DRIVING, TRUCK, FIXTURE_ROUTE)
    truckStateAt(T_DRIVING + 3600_000, TRUCK, FIXTURE_ROUTE) // «другая сессия» между вызовами
    const s2 = truckStateAt(T_DRIVING, TRUCK, FIXTURE_ROUTE)
    expect(s2).toEqual(s1)
  })

  it('позиция лежит на маршруте (по широте фикстуры)', () => {
    const s = truckStateAt(T_DRIVING, TRUCK, FIXTURE_ROUTE)
    expect(s.lat).toBeCloseTo(52, 6)
    expect(s.lng).toBeGreaterThanOrEqual(13)
    expect(s.lng).toBeLessThanOrEqual(18)
  })

  it('в ездовое окно движется, ночью стоит', () => {
    const driving = truckStateAt(T_DRIVING, TRUCK, FIXTURE_ROUTE)
    expect(driving.isDriving).toBe(true)
    expect(driving.speedKmh).toBeGreaterThan(0)
    const night = truckStateAt(Date.UTC(2026, 5, 30, 22), TRUCK, FIXTURE_ROUTE)
    expect(night.isDriving).toBe(false)
    expect(night.speedKmh).toBe(0)
  })

  it('kmToday: ноль в 06:00, растёт к вечеру', () => {
    const morning = truckStateAt(Date.UTC(2026, 5, 30, 6), TRUCK, FIXTURE_ROUTE)
    expect(morning.kmToday).toBeCloseTo(0, 6)
    const evening = truckStateAt(Date.UTC(2026, 5, 30, 18), TRUCK, FIXTURE_ROUTE)
    expect(evening.kmToday).toBeGreaterThan(600)
  })

  it('bearing по фикстуре: восток (~90°) вперёд или запад (~270°) назад', () => {
    const s = truckStateAt(T_DRIVING, TRUCK, FIXTURE_ROUTE)
    const towardEast = Math.abs(s.bearing - 90) < 5
    const towardWest = Math.abs(s.bearing - 270) < 5
    expect(towardEast || towardWest).toBe(true)
  })

  it('фазы разводят фуры по маршруту', () => {
    const positions = new Set(
      ['t001', 't002', 't003', 't004', 't005'].map((id) => {
        const s = truckStateAt(
          T_DRIVING,
          { ...TRUCK, id },
          FIXTURE_ROUTE,
        )
        return s.lng.toFixed(3)
      }),
    )
    expect(positions.size).toBeGreaterThan(3)
  })
})

describe('routeGeometry', () => {
  it('длина фикстуры ≈ 340 км и кэш стабилен', () => {
    const g1 = routeGeometry(FIXTURE_ROUTE)
    const g2 = routeGeometry(FIXTURE_ROUTE)
    expect(g1).toBe(g2)
    expect(g1.totalKm).toBeGreaterThan(330)
    expect(g1.totalKm).toBeLessThan(350)
  })
})
