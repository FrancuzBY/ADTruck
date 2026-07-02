import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ROUTES } from '../data/routes'
import type { Truck } from '../domain/types'
import { CARRIERS, generateFleet } from '../sim/fleet'
import { STORAGE_PREFIX } from './app'

/** Детерминированный базовый флот (одинаков между сессиями). */
const BASE_FLEET = generateFleet(ROUTES)

interface FleetState {
  /** Фуры, добавленные пользователем через /flota/dodaj. Персистятся. */
  userTrucks: Truck[]
  addTruck: (input: { plate: string; routeId: string }) => void
}

export const useFleetStore = create<FleetState>()(
  persist(
    (set) => ({
      userTrucks: [],
      addTruck: ({ plate, routeId }) =>
        set((s) => {
          const n = s.userTrucks.length + 1
          const truck: Truck = {
            id: `u${String(n).padStart(3, '0')}`,
            plate: plate.trim().toUpperCase(),
            carrierId: CARRIERS[0].id, // добавляем в «наш» автопарк
            routeId,
            addedByUser: true,
          }
          return { userTrucks: [...s.userTrucks, truck] }
        }),
    }),
    { name: `${STORAGE_PREFIX}:fleet` },
  ),
)

/** Полный флот = базовый + пользовательский. Пользовательские фуры вливаются в тот же пайплайн. */
export function allTrucks(userTrucks: Truck[]): Truck[] {
  return [...BASE_FLEET, ...userTrucks]
}

export { BASE_FLEET }
