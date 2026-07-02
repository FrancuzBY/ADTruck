#!/usr/bin/env node
/**
 * One-time dev-скрипт: corridors.json → src/data/routes.json.
 *
 * Для каждого коридора берём реальную дорожную геометрию у публичного OSRM
 * (1 rps, ответы кэшируются в scripts/.cache — повторный запуск не ходит в сеть),
 * при отказе — fallback на Valhalla (FOSSGIS). Полилинию упрощаем turf.simplify
 * (~80 м) и кодируем polyline5. Рантайм приложения от этих сервисов НЕ зависит.
 *
 * Запуск: node scripts/fetch-routes.mjs [--force]
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import polyline from '@mapbox/polyline'
import simplify from '@turf/simplify'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CACHE_DIR = path.join(__dirname, '.cache')
const OUT_FILE = path.join(__dirname, '..', 'src', 'data', 'routes.json')
const FORCE = process.argv.includes('--force')

/** ~80 м в градусах на широте центральной Европы. */
const SIMPLIFY_TOLERANCE = 0.0008
const RATE_LIMIT_MS = 1100
const UA = 'AdTruck-POC-route-prefetch/0.1 (one-time dev script; 1 rps)'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchJson(url, init) {
  const res = await fetch(url, { ...init, headers: { 'User-Agent': UA, ...init?.headers } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

/** OSRM: geometry = polyline5, distance в метрах. */
async function fromOsrm(c) {
  const coords = `${c.from.lng},${c.from.lat};${c.to.lng},${c.to.lat}`
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=polyline&alternatives=false&steps=false`
  const data = await fetchJson(url)
  if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error(`OSRM code=${data.code}`)
  const route = data.routes[0]
  return { latlngs: polyline.decode(route.geometry, 5), meters: route.distance }
}

/** Valhalla (FOSSGIS): shape = polyline6, length в км. */
async function fromValhalla(c) {
  const body = {
    locations: [
      { lat: c.from.lat, lon: c.from.lng },
      { lat: c.to.lat, lon: c.to.lng },
    ],
    costing: 'truck',
    directions_options: { units: 'kilometers' },
  }
  const data = await fetchJson('https://valhalla1.openstreetmap.de/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const legs = data.trip?.legs
  if (!legs?.length) throw new Error('Valhalla: no legs')
  const latlngs = legs.flatMap((leg) => polyline.decode(leg.shape, 6))
  return { latlngs, meters: data.trip.summary.length * 1000 }
}

async function geometryFor(c) {
  const cacheFile = path.join(CACHE_DIR, `${c.id}.json`)
  if (!FORCE && existsSync(cacheFile)) {
    return JSON.parse(await readFile(cacheFile, 'utf8'))
  }
  let result
  try {
    result = await fromOsrm(c)
  } catch (err) {
    console.warn(`  OSRM failed (${err.message}), retrying once…`)
    await sleep(RATE_LIMIT_MS * 2)
    try {
      result = await fromOsrm(c)
    } catch (err2) {
      console.warn(`  OSRM failed again (${err2.message}), falling back to Valhalla`)
      result = await fromValhalla(c)
    }
  }
  await writeFile(cacheFile, JSON.stringify(result))
  await sleep(RATE_LIMIT_MS)
  return result
}

const { corridors } = JSON.parse(await readFile(path.join(__dirname, 'corridors.json'), 'utf8'))
await mkdir(CACHE_DIR, { recursive: true })
await mkdir(path.dirname(OUT_FILE), { recursive: true })

const routes = []
for (const c of corridors) {
  process.stdout.write(`${c.id}: ${c.from.name} → ${c.to.name}… `)
  const { latlngs, meters } = await geometryFor(c)
  // GeoJSON — [lng, lat]; polyline.decode отдаёт [lat, lng]
  const feature = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: latlngs.map(([lat, lng]) => [lng, lat]) },
  }
  const simplified = simplify(feature, { tolerance: SIMPLIFY_TOLERANCE, highQuality: false })
  const encoded = polyline.encode(
    simplified.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    5,
  )
  routes.push({
    id: c.id,
    name: `${c.from.name} – ${c.to.name}`,
    from: c.from.name,
    to: c.to.name,
    countries: c.countries,
    cities: c.cities,
    lengthKm: Math.round(meters / 1000),
    urbanShare: c.urbanShare,
    polyline: encoded,
  })
  console.log(`${Math.round(meters / 1000)} km, ${simplified.geometry.coordinates.length} pts (из ${latlngs.length})`)
}

const json = JSON.stringify(routes)
await writeFile(OUT_FILE, json)
const kb = (json.length / 1024).toFixed(0)
console.log(`\n✓ ${routes.length} маршрутов → ${path.relative(process.cwd(), OUT_FILE)} (${kb} KB)`)
if (json.length > 1_500_000) {
  console.error('⚠ routes.json > 1.5 MB — подними SIMPLIFY_TOLERANCE')
  process.exit(1)
}
