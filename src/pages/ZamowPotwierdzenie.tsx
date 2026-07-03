import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[22px]">
    <path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)
const BarsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[22px]">
    <path d="M4 20V10M10 20V4M16 20v-6M22 20H2" />
  </svg>
)

const features = [
  { title: 'GPS na żywo', text: 'Śledź swoje naczepy na mapie Europy w czasie rzeczywistym.', to: '/mapa', cta: 'Zobacz mapę', icon: <PinIcon /> },
  { title: 'Raporty kampanii', text: 'Przebieg, wyświetlenia i pokrycie w jednym miejscu.', to: '/kampanie', cta: 'Twoje kampanie', icon: <BarsIcon /> },
]

export function ZamowPotwierdzenie() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col bg-canvas px-[22px] pt-24 pb-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="mx-auto grid size-[98px] place-items-center rounded-full bg-cta shadow-[0_18px_44px_-12px_rgb(22_163_74_/_0.6)]"
      >
        <svg viewBox="0 0 52 52" className="size-[54px]" fill="none">
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
        className="mx-auto mt-3 max-w-xs text-center text-[15px] leading-relaxed text-ink-muted"
      >
        Twoja reklama wkrótce ruszy w trasę. Poniżej znajdziesz narzędzia do śledzenia.
      </motion.p>

      <motion.div
        className="mt-8 flex flex-col gap-3"
        initial="initial"
        animate="animate"
        transition={{ delayChildren: 0.55, staggerChildren: 0.1 }}
      >
        {features.map((f) => (
          <motion.div
            key={f.to}
            variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}
            className="rounded-[20px] border border-line bg-surface p-[18px]"
          >
            <div className="flex items-center gap-3">
              <div className="grid size-[42px] flex-none place-items-center rounded-[13px] bg-brand-soft text-neon">
                {f.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-[15.5px] font-semibold text-ink">{f.title}</h2>
                <p className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">{f.text}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(f.to)}
              className="mt-3.5 w-full rounded-[13px] border border-line bg-surface-2 py-3.5 text-[14.5px] font-semibold text-ink transition-colors hover:bg-surface"
            >
              {f.cta}
            </button>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex-1" />
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-4 w-full py-3 text-[14.5px] font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        Wróć na stronę główną
      </button>
    </div>
  )
}
