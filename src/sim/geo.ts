/** Геометрия маршрутов: polyline5, хаверсин, позиция на полилинии. Без зависимостей. */

/** GeoJSON-порядок: [lng, lat]. */
export type LngLat = [number, number]

/** Декодер Google encoded polyline, precision 5 (формат OSRM и routes.json). */
export function decodePolyline5(encoded: string): LngLat[] {
  const points: LngLat[] = []
  let index = 0
  let lat = 0
  let lng = 0
  while (index < encoded.length) {
    for (const axis of [0, 1]) {
      let result = 0
      let shift = 0
      let byte: number
      do {
        byte = encoded.charCodeAt(index++) - 63
        result |= (byte & 0x1f) << shift
        shift += 5
      } while (byte >= 0x20)
      const delta = result & 1 ? ~(result >> 1) : result >> 1
      if (axis === 0) lat += delta
      else lng += delta
    }
    points.push([lng / 1e5, lat / 1e5])
  }
  return points
}

function encodeSigned(value: number, out: string[]): void {
  let v = value < 0 ? ~(value << 1) : value << 1
  while (v >= 0x20) {
    out.push(String.fromCharCode((0x20 | (v & 0x1f)) + 63))
    v >>= 5
  }
  out.push(String.fromCharCode(v + 63))
}

/** Кодер polyline5 — для тестовых фикстур (roundtrip с декодером). */
export function encodePolyline5(points: LngLat[]): string {
  const out: string[] = []
  let prevLat = 0
  let prevLng = 0
  for (const [lng, lat] of points) {
    const latE5 = Math.round(lat * 1e5)
    const lngE5 = Math.round(lng * 1e5)
    encodeSigned(latE5 - prevLat, out)
    encodeSigned(lngE5 - prevLng, out)
    prevLat = latE5
    prevLng = lngE5
  }
  return out.join('')
}

const EARTH_RADIUS_KM = 6371
const toRad = (deg: number) => (deg * Math.PI) / 180
const toDeg = (rad: number) => (rad * 180) / Math.PI

export function haversineKm(a: LngLat, b: LngLat): number {
  const dLat = toRad(b[1] - a[1])
  const dLng = toRad(b[0] - a[0])
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(s))
}

/** Начальный азимут a→b в градусах, 0 = север, по часовой. */
export function bearingDeg(a: LngLat, b: LngLat): number {
  const φ1 = toRad(a[1])
  const φ2 = toRad(b[1])
  const dLng = toRad(b[0] - a[0])
  const y = Math.sin(dLng) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

/** Кумулятивные километры по вершинам: cum[0] = 0, cum[последняя] = длина линии. */
export function cumulativeKm(points: LngLat[]): number[] {
  const cum = new Array<number>(points.length)
  cum[0] = 0
  for (let i = 1; i < points.length; i++) {
    cum[i] = cum[i - 1] + haversineKm(points[i - 1], points[i])
  }
  return cum
}

export interface PointOnLine {
  lng: number
  lat: number
  bearing: number
}

/** Точка на полилинии в km от старта: binary search по cum + линейная интерполяция сегмента. */
export function pointAtDistance(points: LngLat[], cum: number[], km: number): PointOnLine {
  const total = cum[cum.length - 1]
  const d = Math.min(Math.max(km, 0), total)
  let lo = 0
  let hi = cum.length - 1
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1
    if (cum[mid] <= d) lo = mid
    else hi = mid
  }
  const segLen = cum[lo + 1] - cum[lo]
  const t = segLen > 0 ? (d - cum[lo]) / segLen : 0
  const [lng1, lat1] = points[lo]
  const [lng2, lat2] = points[lo + 1]
  return {
    lng: lng1 + (lng2 - lng1) * t,
    lat: lat1 + (lat2 - lat1) * t,
    bearing: bearingDeg(points[lo], points[lo + 1]),
  }
}
