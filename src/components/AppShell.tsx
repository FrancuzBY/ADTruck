import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { setSimSpeed } from '../sim/clock'
import { useAppStore } from '../store/app'
import { BottomNav } from './BottomNav'

/** Mobile-first app-shell: колонка max-w-md по центру, контент над нижней навигацией. */
export function AppShell() {
  const simSpeed = useAppStore((s) => s.simSpeed)
  // Единая точка синхронизации стора со симуляционными часами (включая rehydrate persist).
  useEffect(() => {
    setSimSpeed(simSpeed)
  }, [simSpeed])

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-canvas shadow-card">
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
