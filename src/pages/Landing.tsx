import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { pl } from '../i18n/pl'
import { formatNumber, plPlural } from '../i18n/format'
import { allTrucks, useFleetStore } from '../store/fleet'

const naczepaForms = { one: 'naczepa', few: 'naczepy', many: 'naczep' }

// Узлы стилизованной карты Европы (viewBox 390×520).
const C = {
  gdansk: { x: 298, y: 150, label: 'Gdańsk' },
  warszawa: { x: 330, y: 250, label: 'Warszawa' },
  krakow: { x: 300, y: 322, label: 'Kraków' },
  berlin: { x: 205, y: 250 },
  wroclaw: { x: 250, y: 292 },
  praga: { x: 220, y: 302 },
  wieden: { x: 250, y: 352 },
  amsterdam: { x: 150, y: 226 },
  paryz: { x: 116, y: 336 },
  rzym: { x: 250, y: 452, label: 'Rzym' },
  madryt: { x: 56, y: 470, label: 'Madryt' },
} as const

type Node = { x: number; y: number; label?: string }
const NODES = C as Record<string, Node>

// Лучи-маршруты + базовая длительность (умножается для «медленно и плавно»).
const ROUTES: [keyof typeof C, keyof typeof C, number][] = [
  ['warszawa', 'gdansk', 6.5],
  ['warszawa', 'berlin', 7.5],
  ['warszawa', 'krakow', 6],
  ['krakow', 'wieden', 7],
  ['wieden', 'rzym', 9],
  ['berlin', 'amsterdam', 6.8],
  ['wroclaw', 'paryz', 9.5],
  ['paryz', 'madryt', 11],
  ['warszawa', 'praga', 7.2],
]

// Замедление анимации — спокойное, ненавязчивое движение.
const SLOW = 3.6

const routePath = (a: Node, b: Node) => `M${a.x} ${a.y}L${b.x} ${b.y}`

export function Landing() {
  const userTrucks = useFleetStore((s) => s.userTrucks)
  const count = useMemo(() => allTrucks(userTrucks).length, [userTrucks])

  return (
    <div className="relative flex min-h-dvh flex-col justify-center overflow-hidden bg-[radial-gradient(130%_80%_at_50%_-6%,#16274a_0%,#0b1019_46%,#06090f_100%)] px-7 pt-14 pb-24">
      <svg
        aria-hidden
        viewBox="0 0 390 520"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 size-full opacity-90"
      >
        {ROUTES.map(([a, b], i) => (
          <path key={`glow${i}`} id={`beam${i}`} d={routePath(NODES[a], NODES[b])} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" opacity="0.1" />
        ))}
        {ROUTES.map(([a, b, dur], i) => (
          <path
            key={`flow${i}`}
            d={routePath(NODES[a], NODES[b])}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeDasharray="1 13"
            opacity="0.7"
            style={{ animation: `beamflow ${dur * SLOW}s linear infinite` }}
          />
        ))}
        {ROUTES.map(([, , dur], i) => (
          <g key={`dot${i}`}>
            <circle r="5" fill="#a3e635" opacity="0.22">
              <animateMotion dur={`${dur * SLOW}s`} repeatCount="indefinite" begin={`${i * 1.1}s`}>
                <mpath xlinkHref={`#beam${i}`} />
              </animateMotion>
            </circle>
            <circle r="2.4" fill="#a3e635">
              <animateMotion dur={`${dur * SLOW}s`} repeatCount="indefinite" begin={`${i * 1.1}s`}>
                <mpath xlinkHref={`#beam${i}`} />
              </animateMotion>
            </circle>
          </g>
        ))}
        {Object.values(NODES).map((n, i) => (
          <g key={`node${i}`}>
            <circle cx={n.x} cy={n.y} r="5.5" fill="#22d3ee" opacity="0.18" />
            <circle cx={n.x} cy={n.y} r="2.6" fill="#22d3ee" />
            {n.label && (
              <text x={n.x + 9} y={n.y + 4} fill="#8a94a6" fontSize="11" fontFamily="'Geist Mono Variable', monospace">
                {n.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0a0e16_2%,rgba(10,14,22,0)_26%,rgba(6,9,15,0)_60%,#06090f_98%)]" />

      <motion.div className="relative z-10 flex flex-col" initial="i" animate="a" transition={{ staggerChildren: 0.08 }}>
        <motion.div variants={{ i: { opacity: 0, y: 10 }, a: { opacity: 1, y: 0 } }} className="flex items-center gap-2.5">
          <span className="size-[7px] rounded-full bg-live shadow-[0_0_12px_var(--color-live)]" />
          <span className="font-mono text-[11.5px] tracking-[0.18em] text-live uppercase">Pitch · 2026</span>
        </motion.div>

        <motion.h1
          variants={{ i: { opacity: 0, y: 12 }, a: { opacity: 1, y: 0 } }}
          className="mt-6 font-display text-[64px] leading-[0.9] font-extrabold tracking-[-0.038em] text-white"
        >
          {pl.appName}
        </motion.h1>
        <motion.p
          variants={{ i: { opacity: 0, y: 12 }, a: { opacity: 1, y: 0 } }}
          className="mt-4 max-w-[300px] font-display text-[24px] leading-[1.16] font-medium tracking-tight text-[#c3d0e6]"
        >
          {pl.tagline}
        </motion.p>

        <div className="h-[clamp(56px,18vh,190px)]" />

        <motion.div
          variants={{ i: { opacity: 0, y: 12 }, a: { opacity: 1, y: 0 } }}
          className="mb-4 flex items-center gap-3 rounded-2xl border border-live/20 bg-surface/60 px-4 py-3.5 backdrop-blur-md"
        >
          <span className="size-2 flex-none animate-[softpulse_1.8s_ease-in-out_infinite] rounded-full bg-live shadow-[0_0_10px_var(--color-live)]" />
          <span className="font-mono text-[12.5px] leading-snug text-[#cdd7e6]">
            <b className="text-white">{formatNumber(count)} {plPlural(count, naczepaForms)}</b> w trasie przez całą Europę
          </span>
        </motion.div>

        <motion.div variants={{ i: { opacity: 0, y: 12 }, a: { opacity: 1, y: 0 } }}>
          <Link
            to="/zamow"
            className="flex w-full items-center justify-center gap-2.5 rounded-full bg-cta py-[17px] text-[16.5px] font-semibold text-white shadow-[0_12px_32px_-8px_rgb(22_163_74_/_0.65)] transition-colors hover:bg-cta-strong"
          >
            Rozpocznij demo
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-[18px]">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        </motion.div>
        <motion.p variants={{ i: { opacity: 0, y: 12 }, a: { opacity: 1, y: 0 } }} className="mt-4 text-center text-[11.5px] text-ink-faint">
          Mobilna platforma reklamy na naczepach TIR
        </motion.p>
      </motion.div>
    </div>
  )
}
