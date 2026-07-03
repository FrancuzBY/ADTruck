import type { ReactElement } from 'react'
import { NavLink } from 'react-router'
import { pl } from '../i18n/pl'
import { useAppStore } from '../store/app'

type NavItem = { to: string; label: string; icon: ReactElement }

const icon = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="size-[22px]">
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9.5V20h13V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="size-[22px]">
      <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z" strokeLinejoin="round" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  ),
  megaphone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="size-[22px]">
      <path d="M4 10v4a1 1 0 0 0 1 1h2l4 4h2V5h-2L7 9H5a1 1 0 0 0-1 1Z" strokeLinejoin="round" />
      <path d="M16.5 9.5a4 4 0 0 1 0 5M19 7a8 8 0 0 1 0 10" strokeLinecap="round" />
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="size-[22px]">
      <path d="M2.5 6h11v10h-11zM13.5 9h4l3 3v4h-7" strokeLinejoin="round" />
      <circle cx="6.5" cy="17.5" r="1.75" />
      <circle cx="17" cy="17.5" r="1.75" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="size-[22px]">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
    </svg>
  ),
}

/**
 * Плавающая пилюля-навигация: активная вкладка «раскрывается» в cyan-капсулу с подписью
 * и подсветкой, неактивные — только иконки. Набор зависит от роли (Kampanie ↔ Flota).
 */
export function BottomNav() {
  const role = useAppStore((s) => s.role)

  const items: NavItem[] = [
    { to: '/', label: pl.nav.start, icon: icon.home },
    { to: '/mapa', label: pl.nav.mapa, icon: icon.map },
    role === 'advertiser'
      ? { to: '/kampanie', label: pl.nav.kampanie, icon: icon.megaphone }
      : { to: '/flota', label: pl.nav.flota, icon: icon.truck },
    { to: '/profil', label: pl.nav.profil, icon: icon.user },
  ]

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md px-5 pb-[max(16px,env(safe-area-inset-bottom))]">
      <ul className="pointer-events-auto flex items-center justify-around gap-1 rounded-full border border-line bg-surface/80 p-1.5 shadow-[0_12px_40px_-10px_rgb(0_0_0_/_0.8)] backdrop-blur-xl">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === '/'} aria-label={item.label}>
              {({ isActive }) => (
                <span
                  className={`flex items-center gap-2 rounded-full px-3.5 py-2.5 transition-colors ${
                    isActive
                      ? 'bg-neon/15 text-neon shadow-[0_0_16px_-2px_rgb(34_211_238_/_0.35)]'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {item.icon}
                  {isActive && <span className="text-[12.5px] font-semibold">{item.label}</span>}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
