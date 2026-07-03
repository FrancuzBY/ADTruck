import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { LazyMapView as MapView } from '../components/map/LazyMapView'
import { pl } from '../i18n/pl'
import { allTrucks, useFleetStore } from '../store/fleet'

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-[18px]">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
)

const props = [
  {
    title: pl.landing.propGpsTitle,
    text: pl.landing.propGpsText,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[22px]">
        <path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    title: pl.landing.propReachTitle,
    text: pl.landing.propReachText,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[22px]">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z" />
      </svg>
    ),
  },
  {
    title: pl.landing.propReportsTitle,
    text: pl.landing.propReportsText,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[22px]">
        <path d="M4 20V10M10 20V4M16 20v-6M22 20H2" />
      </svg>
    ),
  },
]

const fade = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } }

export function Landing() {
  const userTrucks = useFleetStore((s) => s.userTrucks)
  const trucks = useMemo(() => allTrucks(userTrucks), [userTrucks])
  const getTrucks = useMemo(() => () => trucks, [trucks])

  return (
    <div className="min-h-full bg-gradient-to-b from-white via-canvas to-[#eef2fa] px-[22px] pt-[78px] pb-4">
      <motion.div initial="initial" animate="animate" transition={{ staggerChildren: 0.07 }}>
        <motion.span
          variants={fade}
          className="font-mono text-[11.5px] font-medium tracking-[0.16em] text-accent uppercase"
        >
          {pl.appName}
        </motion.span>
        <motion.h1
          variants={fade}
          className="mt-3 font-display text-[35px] leading-[1.02] font-extrabold tracking-tight text-balance text-ink"
        >
          {pl.landing.heroTitle}
        </motion.h1>
        <motion.p variants={fade} className="mt-3.5 text-[15.5px] leading-relaxed text-ink-muted">
          {pl.landing.heroSubtitle}
        </motion.p>

        <motion.div variants={fade}>
          <Link
            to="/zamow"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-cta px-6 py-4 text-base font-semibold text-white shadow-[0_10px_26px_-10px_rgb(22_163_74_/_0.55)] transition-colors hover:bg-cta-strong"
          >
            {pl.landing.cta}
            <ArrowRight />
          </Link>
        </motion.div>

        <motion.div
          variants={fade}
          className="relative mt-5 h-[174px] overflow-hidden rounded-[22px] border border-line shadow-[0_18px_36px_-22px_rgb(30_58_138_/_0.3)]"
        >
          <MapView getTrucks={getTrucks} fleetKey={userTrucks.length} interactive={false} theme="light" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-line bg-white/92 px-2.5 py-1.5 shadow-sm">
            <span className="size-1.5 rounded-full bg-cta" />
            <span className="font-mono text-[10.5px] text-ink">na żywo</span>
          </div>
        </motion.div>

        <div className="mt-4 flex flex-col gap-3">
          {props.map((p) => (
            <motion.article
              key={p.title}
              variants={fade}
              className="flex items-start gap-3.5 rounded-[20px] border border-line bg-surface p-4 shadow-card"
            >
              <div className="grid size-[42px] flex-none place-items-center rounded-[13px] bg-brand-soft text-brand">
                {p.icon}
              </div>
              <div>
                <h2 className="text-[15.5px] font-semibold text-ink">{p.title}</h2>
                <p className="mt-0.5 text-[13px] leading-snug text-ink-muted">{p.text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
