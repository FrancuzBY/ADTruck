import mapboxPolyline from '@mapbox/polyline'
import { describe, expect, it } from 'vitest'
import {
  bearingDeg,
  cumulativeKm,
  decodePolyline5,
  encodePolyline5,
  haversineKm,
  pointAtDistance,
  type LngLat,
} from './geo'

const WARSZAWA: LngLat = [21.0122, 52.2297]
const BERLIN: LngLat = [13.405, 52.52]

describe('polyline5', () => {
  const points: LngLat[] = [
    [21.0122, 52.2297],
    [19.456, 51.7592],
    [16.9252, 52.4064],
    [13.405, 52.52],
  ]

  it('roundtrip encode → decode с точностью 1e-5', () => {
    const decoded = decodePolyline5(encodePolyline5(points))
    expect(decoded.length).toBe(points.length)
    decoded.forEach(([lng, lat], i) => {
      expect(lng).toBeCloseTo(points[i][0], 5)
      expect(lat).toBeCloseTo(points[i][1], 5)
    })
  })

  it('совместим с эталонной реализацией @mapbox/polyline', () => {
    const reference = mapboxPolyline.encode(
      points.map(([lng, lat]) => [lat, lng]),
      5,
    )
    expect(encodePolyline5(points)).toBe(reference)
    const decodedRef = mapboxPolyline.decode(reference, 5).map(([lat, lng]) => [lng, lat])
    expect(decodePolyline5(reference)).toEqual(decodedRef)
  })
})

describe('haversineKm', () => {
  it('Warszawa–Berlin ≈ 518 км по прямой', () => {
    expect(haversineKm(WARSZAWA, BERLIN)).toBeGreaterThan(505)
    expect(haversineKm(WARSZAWA, BERLIN)).toBeLessThan(535)
  })

  it('нулевое расстояние до себя', () => {
    expect(haversineKm(WARSZAWA, WARSZAWA)).toBe(0)
  })
})

describe('bearingDeg', () => {
  it('на восток ≈ 90°, на север ≈ 0°', () => {
    expect(bearingDeg([21, 52], [21.5, 52])).toBeCloseTo(90, 0)
    expect(bearingDeg([21, 52], [21, 52.5])).toBeCloseTo(0, 0)
  })
})

describe('cumulativeKm + pointAtDistance', () => {
  const line: LngLat[] = [
    [13, 52],
    [14, 52],
    [15, 52],
    [16, 52],
  ]
  const cum = cumulativeKm(line)

  it('кумулятив монотонный, начинается с нуля', () => {
    expect(cum[0]).toBe(0)
    for (let i = 1; i < cum.length; i++) expect(cum[i]).toBeGreaterThan(cum[i - 1])
  })

  it('интерполирует середину сегмента', () => {
    const mid = pointAtDistance(line, cum, cum[1] / 2)
    expect(mid.lng).toBeCloseTo(13.5, 2)
    expect(mid.lat).toBeCloseTo(52, 6)
    expect(mid.bearing).toBeCloseTo(90, 0)
  })

  it('клампит за границами: до старта и после финиша', () => {
    const before = pointAtDistance(line, cum, -5)
    expect([before.lng, before.lat]).toEqual([13, 52])
    const after = pointAtDistance(line, cum, cum[cum.length - 1] + 100)
    expect(after.lng).toBeCloseTo(16, 6)
  })
})
