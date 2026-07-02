import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'advertiser' | 'carrier'
export type SimSpeed = 1 | 60

interface AppState {
  role: Role
  simSpeed: SimSpeed
  setRole: (role: Role) => void
  setSimSpeed: (simSpeed: SimSpeed) => void
}

/** Префикс версионируем (adtruck-v1) — «Resetuj demo» чистит все ключи с ним. */
export const STORAGE_PREFIX = 'adtruck-v1'

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: 'advertiser',
      simSpeed: 1,
      setRole: (role) => set({ role }),
      setSimSpeed: (simSpeed) => set({ simSpeed }),
    }),
    { name: `${STORAGE_PREFIX}:app` },
  ),
)

export function resetDemo() {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(STORAGE_PREFIX)) localStorage.removeItem(key)
  }
  window.location.assign('/')
}
