import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const features = [
  {
    title: 'GPS na żywo',
    text: 'Śledź swoje naczepy na mapie Europy w czasie rzeczywistym.',
    to: '/mapa',
    cta: 'Zobacz mapę',
  },
  {
    title: 'Raporty kampanii',
    text: 'Przebieg, wyświetlenia i pokrycie w jednym miejscu.',
    to: '/kampanie',
    cta: 'Twoje kampanie',
  },
]

export function ZamowPotwierdzenie() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col items-center px-4 pt-20 pb-8 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="grid size-20 place-items-center rounded-full bg-cta/12"
      >
        <svg viewBox="0 0 52 52" className="size-11">
          <motion.path
            d="M14 27l8 8 16-16"
            fill="none"
            stroke="var(--color-cta)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-6 text-2xl font-bold"
      >
        Kampania utworzona!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-2 max-w-xs text-sm text-ink-muted"
      >
        Twoja reklama wkrótce ruszy w trasę. Poniżej znajdziesz narzędzia do śledzenia.
      </motion.p>

      <motion.div
        className="mt-8 w-full space-y-3"
        initial="initial"
        animate="animate"
        transition={{ delayChildren: 0.55, staggerChildren: 0.1 }}
      >
        {features.map((f) => (
          <motion.div
            key={f.to}
            variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}
          >
            <Card className="flex items-center gap-4 p-4 text-left">
              <div className="flex-1">
                <h2 className="text-base font-semibold">{f.title}</h2>
                <p className="mt-0.5 text-sm text-ink-muted">{f.text}</p>
              </div>
              <Button variant="secondary" className="shrink-0 px-4 py-2 text-sm" onClick={() => navigate(f.to)}>
                {f.cta}
              </Button>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex-1" />
      <Button variant="ghost" className="mt-6" onClick={() => navigate('/')}>
        Wróć na stronę główną
      </Button>
    </div>
  )
}
