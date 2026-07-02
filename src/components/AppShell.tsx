import { Outlet } from 'react-router'
import { BottomNav } from './BottomNav'

/** Mobile-first app-shell: колонка max-w-md по центру, контент над нижней навигацией. */
export function AppShell() {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-canvas shadow-card">
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
