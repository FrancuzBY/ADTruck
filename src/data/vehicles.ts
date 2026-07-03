import { hashStringToSeed, mulberry32 } from '../sim/rng'

/** Рекламные креативы на борт наczepy (вымышленные бренды, разные цвета). */
export interface Creative {
  id: string
  name: string
  bg: string
  fg: string
  accent: string
}

export const CREATIVES: Creative[] = [
  { id: 'cola', name: 'FreshCola', bg: '#e11d48', fg: '#ffffff', accent: '#fde047' },
  { id: 'nova', name: 'NovaTech', bg: '#0ea5e9', fg: '#ffffff', accent: '#e0f2fe' },
  { id: 'kawa', name: 'Kawa Roasto', bg: '#78350f', fg: '#fde68a', accent: '#f59e0b' },
  { id: 'eco', name: 'EcoRide', bg: '#15803d', fg: '#ffffff', accent: '#bbf7d0' },
  { id: 'moda', name: 'Moda Lux', bg: '#18181b', fg: '#ffffff', accent: '#f472b6' },
  { id: 'pay', name: 'PayFast', bg: '#4f46e5', fg: '#ffffff', accent: '#a5b4fc' },
  { id: 'sport', name: 'ProSport', bg: '#ea580c', fg: '#ffffff', accent: '#fed7aa' },
  { id: 'market', name: 'FreshMarket', bg: '#be123c', fg: '#ffffff', accent: '#fecdd3' },
]

export const creativeById = (id: string): Creative =>
  CREATIVES.find((c) => c.id === id) ?? CREATIVES[0]

/** Модели тягачей — у каждого свой цвет кабины. */
export interface Tractor {
  name: string
  cab: string
}
export const TRACTORS: Tractor[] = [
  { name: 'Volvo FH', cab: '#1d4ed8' },
  { name: 'Scania R', cab: '#b91c1c' },
  { name: 'MAN TGX', cab: '#0e7490' },
  { name: 'DAF XF', cab: '#b45309' },
  { name: 'Mercedes Actros', cab: '#475569' },
  { name: 'Renault T', cab: '#6d28d9' },
  { name: 'Iveco S-Way', cab: '#0369a1' },
]

/** Типы наczep — разный вид кузова (борт под рекламу есть у всех). */
export type TrailerKind = 'curtain' | 'box' | 'reefer'
export interface Trailer {
  id: string
  label: string
  kind: TrailerKind
}
export const TRAILERS: Trailer[] = [
  { id: 'firanowa', label: 'Firanowa', kind: 'curtain' },
  { id: 'kontener', label: 'Kontener', kind: 'box' },
  { id: 'chlodnia', label: 'Chłodnia', kind: 'reefer' },
  { id: 'plandeka', label: 'Plandeka', kind: 'curtain' },
]

/** Страна принадлежности (гос. регистрация). Цвета — для флажка. */
export interface Country {
  code: string
  name: string
}
export const COUNTRIES: Record<string, Country> = {
  PL: { code: 'PL', name: 'Polska' },
  DE: { code: 'DE', name: 'Niemcy' },
  CZ: { code: 'CZ', name: 'Czechy' },
  LT: { code: 'LT', name: 'Litwa' },
  SK: { code: 'SK', name: 'Słowacja' },
  NL: { code: 'NL', name: 'Holandia' },
}
const OTHER_COUNTRIES = ['DE', 'CZ', 'LT', 'SK', 'NL']

export interface TruckProfile {
  tractor: Tractor
  trailer: Trailer
  country: Country
  creativeId: string
}

/**
 * Детерминированный «паспорт» фуры из её id. Сид с суффиксом '#profile',
 * чтобы НЕ пересекаться с truckParams (определяет позицию/симуляцию).
 */
export function truckProfile(id: string): TruckProfile {
  const rng = mulberry32(hashStringToSeed(id + '#profile'))
  const tractor = TRACTORS[Math.floor(rng() * TRACTORS.length)]
  const trailer = TRAILERS[Math.floor(rng() * TRAILERS.length)]
  const code = rng() < 0.62 ? 'PL' : OTHER_COUNTRIES[Math.floor(rng() * OTHER_COUNTRIES.length)]
  const creativeId = CREATIVES[Math.floor(rng() * CREATIVES.length)].id
  return { tractor, trailer, country: COUNTRIES[code], creativeId }
}
