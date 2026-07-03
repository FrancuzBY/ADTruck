import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ROUTES } from '../data/routes'
import { truckProfile } from '../data/vehicles'
import type { Truck } from '../domain/types'
import { CARRIERS, generateFleet } from '../sim/fleet'
import { STORAGE_PREFIX } from './app'

/** Детерминированный базовый флот (одинаков между сессиями). */
const BASE_FLEET = generateFleet(ROUTES)

interface FleetState {
  /** Фуры, добавленные пользователем через /flota/dodaj. Персистятся. */
  userTrucks: Truck[]
  /** Пользовательский выбор рекламного креатива по фуре (иначе — дефолт из профиля). */
  creativeByTruck: Record<string, string>
  addTruck: (input: { plate: string; routeId: string }) => void
  setCreative: (truckId: string, creativeId: string) => void
}

export const useFleetStore = create<FleetState>()(
  persist(
    (set) => ({
      userTrucks: [],
      creativeByTruck: {},
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
      setCreative: (truckId, creativeId) =>
        set((s) => ({ creativeByTruck: { ...s.creativeByTruck, [truckId]: creativeId } })),
    }),
    {
      name: `${STORAGE_PREFIX}:fleet`,
      partialize: (s) => ({ userTrucks: s.userTrucks, creativeByTruck: s.creativeByTruck }),
    },
  ),
)

/** Полный флот = базовый + пользовательский. Пользовательские фуры вливаются в тот же пайплайн. */
export function allTrucks(userTrucks: Truck[]): Truck[] {
  return [...BASE_FLEET, ...userTrucks]
}

/** Креатив фуры: пользовательский выбор или дефолт из детерминированного профиля. */
export function creativeIdFor(truckId: string, overrides: Record<string, string>): string {
  return overrides[truckId] ?? truckProfile(truckId).creativeId
}

export { BASE_FLEET }
