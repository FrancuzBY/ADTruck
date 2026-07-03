import { countryNamePl } from '../data/countries'
import { routeById } from '../data/routes'
import type { Truck } from '../domain/types'
import { formatMln } from '../i18n/format'
import { nextStop, truckDistanceAlong } from './stops'

export type FeedKind = 'milestone' | 'arrival' | 'country'
export interface FeedEvent {
  id: string
  kind: FeedKind
  text: string
  sub: string
  order: number
}

const MILESTONES = [10_000_000, 5_000_000, 2_000_000, 1_000_000, 500_000]

/** Детерминированная лента «живых» событий кампании из текущих состояний фур. */
export function campaignFeed(trucks: Truck[], impressions: number, nowMs: number): FeedEvent[] {
  const ev: FeedEvent[] = []

  const passed = MILESTONES.find((m) => impressions >= m)
  if (passed) ev.push({ id: `ms-${passed}`, kind: 'milestone', text: `Osiągnięto ${formatMln(passed)} wyświetleń`, sub: 'kamień milowy', order: -1 })

  for (const t of trucks) {
    const route = routeById(t.routeId)
    if (!route) continue
    const ns = nextStop(nowMs, t, route)
    if (ns) {
      if (ns.distanceKm < 6) ev.push({ id: `arr-${t.id}`, kind: 'arrival', text: `${t.plate} dotarła do ${ns.city}`, sub: 'przyjazd', order: ns.distanceKm })
      else if (ns.distanceKm < 45) ev.push({ id: `arr-${t.id}`, kind: 'arrival', text: `${t.plate} zbliża się do ${ns.city}`, sub: `${Math.round(ns.distanceKm)} km`, order: ns.distanceKm })
    }
    const da = truckDistanceAlong(nowMs, t, route)
    if (da.forward && route.countries.length > 1) {
      const n = route.countries.length
      const pos = da.frac * n
      const idx = Math.min(Math.floor(pos), n - 1)
      const into = pos - idx
      if (idx > 0 && into < 0.1) {
        ev.push({ id: `ctry-${t.id}`, kind: 'country', text: `${t.plate} wjechała do ${countryNamePl(route.countries[idx])}`, sub: 'nowy kraj', order: 3 + into * 40 })
      }
    }
  }

  ev.sort((a, b) => a.order - b.order)
  const seen = new Set<string>()
  const out: FeedEvent[] = []
  for (const e of ev) {
    const key = e.kind === 'milestone' ? e.id : e.id.slice(e.id.indexOf('-') + 1)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(e)
    if (out.length >= 8) break
  }
  return out
}
