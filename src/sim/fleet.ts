import type { Carrier, Route, Truck } from '../domain/types'
import { hashStringToSeed, mulberry32 } from './rng'

/** ~12 перевозчиков; «наш» автопарк в роли przewoźnik — Trans-Pol Logistics. */
export const CARRIERS: Carrier[] = [
  { id: 'c-transpol', name: 'Trans-Pol Logistics', isMine: true },
  { id: 'c-poltrans', name: 'PolTrans Poznań', isMine: false },
  { id: 'c-baltyk', name: 'Bałtyk Cargo', isMine: false },
  { id: 'c-silesia', name: 'Silesia Trucks', isMine: false },
  { id: 'c-odra', name: 'Odra Logistik', isMine: false },
  { id: 'c-vistula', name: 'Vistula Trans', isMine: false },
  { id: 'c-mazur', name: 'Mazur Trans', isMine: false },
  { id: 'c-pomorze', name: 'Pomorze Express', isMine: false },
  { id: 'c-karpaty', name: 'Karpaty Trans', isMine: false },
  { id: 'c-lodz', name: 'Łódź Speed', isMine: false },
  { id: 'c-transeuropa', name: 'TransEuropa PL', isMine: false },
  { id: 'c-husaria', name: 'Husaria Logistics', isMine: false },
]

/** Префикс польских номеров по «домашнему» воеводству перевозчика. */
const PLATE_PREFIX: Record<string, string> = {
  'c-transpol': 'WA',
  'c-poltrans': 'PO',
  'c-baltyk': 'GD',
  'c-silesia': 'SK',
  'c-odra': 'DW',
  'c-vistula': 'KR',
  'c-mazur': 'NO',
  'c-pomorze': 'ZS',
  'c-karpaty': 'RZ',
  'c-lodz': 'EL',
  'c-transeuropa': 'LU',
  'c-husaria': 'BI',
}

export const FLEET_SIZE = 120
/** Первые 12 бортов — наши (дашборд «Moja flota» непустой из коробки). */
const MINE_COUNT = 12

/**
 * Детерминированная генерация флота: id t001..t120, номер и маршрут — из seed(id).
 * Фуры, добавленные пользователем, вливаются в тот же пайплайн отдельно (fleet-store).
 */
export function generateFleet(routes: Route[]): Truck[] {
  if (routes.length === 0) throw new Error('generateFleet: routes must not be empty')
  const trucks: Truck[] = []
  for (let i = 1; i <= FLEET_SIZE; i++) {
    const id = `t${String(i).padStart(3, '0')}`
    const rng = mulberry32(hashStringToSeed(`fleet:${id}`))
    const carrier =
      i <= MINE_COUNT
        ? CARRIERS[0]
        : CARRIERS[1 + Math.floor(rng() * (CARRIERS.length - 1))]
    const plate = `${PLATE_PREFIX[carrier.id]} ${String(10000 + Math.floor(rng() * 90000))}`
    const route = routes[Math.floor(rng() * routes.length)]
    trucks.push({ id, plate, carrierId: carrier.id, routeId: route.id })
  }
  return trucks
}
