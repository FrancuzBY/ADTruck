import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { estimateCampaign } from '../domain/estimator'
import { formatMlnRange, plPlural } from '../i18n/format'
import { liveUrl } from '../lib/liveUrl'
import { useCampaignStore } from '../store/campaign'

const naczepaForms = { one: 'naczepa', few: 'naczepy', many: 'naczep' }
const dayForms = { one: 'dzień', few: 'dni', many: 'dni' }
const monthForms = { one: 'miesiąc', few: 'miesiące', many: 'miesięcy' }

// Детерминированный «салют»: частицы разлетаются из галочки один раз.
const CONFETTI_COLORS = ['#16A34A', '#22D3EE', '#A3E635', '#ffffff', '#f59e0b']
const CONFETTI = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2 + (i % 2 ? 0.2 : -0.2)
  const dist = 92 + (i % 3) * 30
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist + 26,
    size: 5 + (i % 3),
    rot: (i % 2 ? 1 : -1) * (140 + (i % 4) * 60),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }
})

const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-[18px]">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
)

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[11.5px] font-medium text-ink">
      {children}
    </span>
  )
}

export function ZamowPotwierdzenie() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const id = (state as { id?: string } | null)?.id
  const campaign = useCampaignStore((s) => s.campaigns.find((c) => c.id === id) ?? s.campaigns[0])

  if (!campaign) return <Navigate to="/kampanie" replace />

  const est = estimateCampaign(campaign)
  const url = liveUrl(`/kampanie/${campaign.id}`)
  const pretty = url.replace(/^https?:\/\//, '')
  const wholeMonths = Number.isInteger(est.months) ? est.months : null
  const duration =
    wholeMonths !== null
      ? `${wholeMonths} ${plPlural(wholeMonths, monthForms)}`
      : `${est.days} ${plPlural(est.days, dayForms)}`

  return (
    <div className="relative overflow-hidden px-[22px] pt-16 pb-4">
      {/* Атмосферное свечение */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-16 mx-auto h-72 w-72 rounded-full bg-cta/20 blur-[90px]" />

      {/* Галочка успеха + рябь + салют */}
      <div className="relative mx-auto grid size-[92px] place-items-center">
        {[0, 1].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border border-cta/50"
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1.1, delay: 0.2 + i * 0.28, ease: 'easeOut' }}
          />
        ))}
        {CONFETTI.map((c, i) => (
          <motion.span
            key={`c${i}`}
            aria-hidden
            className="absolute top-1/2 left-1/2 rounded-[1px]"
            style={{ width: c.size, height: c.size, background: c.color, marginLeft: -c.size / 2, marginTop: -c.size / 2 }}
            initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
            animate={{ x: c.x, y: c.y, opacity: [0, 1, 1, 0], rotate: c.rot }}
            transition={{ duration: 1.25, delay: 0.35, ease: 'easeOut' }}
          />
        ))}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="grid size-[92px] place-items-center rounded-full bg-cta shadow-[0_18px_44px_-12px_rgb(22_163_74_/_0.6)]"
        >
          <svg viewBox="0 0 52 52" className="size-[52px]" fill="none">
            <motion.path
              d="M13 27l9 9 17-20"
              stroke="#fff"
              strokeWidth="4.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.25, duration: 0.4, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-6 text-center font-display text-[29px] font-extrabold tracking-tight text-ink"
      >
        Kampania utworzona!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mx-auto mt-2.5 max-w-[19rem] text-center text-[15px] leading-relaxed text-ink-muted"
      >
        Twoja reklama rusza w trasę. Zeskanuj kod, aby śledzić ją na żywo na telefonie.
      </motion.p>

      {/* QR-герой: живой отчёт именно этой кампании */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.55, type: 'spring', stiffness: 220, damping: 24 }}
        className="relative mx-auto mt-7 max-w-sm rounded-[24px] border border-line bg-[radial-gradient(120%_120%_at_50%_0%,#141c2b,#0b1019)] p-5"
      >
        <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-live/30 bg-live/10 px-2.5 py-1 text-[10.5px] font-semibold text-live">
          <span className="size-1.5 animate-[softpulse_1.6s_ease-in-out_infinite] rounded-full bg-live shadow-[0_0_8px_var(--color-live)]" />
          Na żywo
        </span>

        <div className="mx-auto w-fit rounded-[20px] bg-white p-3.5 shadow-[0_16px_40px_-16px_rgb(0_0_0_/_0.7)]">
          <QRCodeSVG value={url} size={166} level="M" bgColor="#ffffff" fgColor="#0a0e14" />
        </div>

        <p className="mt-4 text-center text-[13.5px] font-semibold text-ink">Zeskanuj telefonem — raport na żywo</p>
        <p className="mt-1 truncate text-center font-mono text-[11px] text-ink-faint">{pretty}</p>

        <div className="mt-3.5 flex flex-wrap justify-center gap-2">
          <Chip>{campaign.trucks} {plPlural(campaign.trucks, naczepaForms)}</Chip>
          <Chip>zasięg {formatMlnRange(est.impressionsMin, est.impressionsMax)}</Chip>
          <Chip>{duration}</Chip>
        </div>
      </motion.div>

      {/* Действия */}
      <motion.button
        variants={fade}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.7 }}
        type="button"
        onClick={() => navigate(`/kampanie/${campaign.id}`)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-cta py-4 text-base font-semibold text-white shadow-[0_14px_34px_-12px_rgb(22_163_74_/_0.6)] transition-colors hover:bg-cta-strong"
      >
        Otwórz raport na żywo
        <ArrowRight />
      </motion.button>

      <motion.div
        variants={fade}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.78 }}
        className="mt-3 grid grid-cols-2 gap-3"
      >
        <button
          type="button"
          onClick={() => navigate('/mapa')}
          className="rounded-full border border-line bg-surface py-3.5 text-[14px] font-semibold text-ink transition-colors hover:bg-surface-2"
        >
          Mapa na żywo
        </button>
        <button
          type="button"
          onClick={() => navigate('/kampanie')}
          className="rounded-full border border-line bg-surface py-3.5 text-[14px] font-semibold text-ink transition-colors hover:bg-surface-2"
        >
          Twoje kampanie
        </button>
      </motion.div>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-4 w-full py-3 text-[14px] font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        Wróć na stronę główną
      </button>
    </div>
  )
}
