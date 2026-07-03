import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Truck } from '../domain/types'
import { simNow } from '../sim/clock'
import { campaignFeed, type FeedEvent, type FeedKind } from '../sim/feed'

interface Toast {
  id: number
  kind: FeedKind
  text: string
  sub: string
}

const EMOJI: Record<FeedKind, string> = { milestone: '🎯', arrival: '📍', country: '🌍' }
const ICON_BG: Record<FeedKind, string> = {
  milestone: 'bg-live/15',
  arrival: 'bg-neon/15',
  country: 'bg-warn/15',
}

/** Ключ анти-повтора: одно и то же событие фуры не мигает чаще раза в ~45 с. */
const keyOf = (e: FeedEvent) => e.id

interface Props {
  trucks: Truck[]
  /** Кампания: показывать «milestone»-тосты по этим показам. */
  impressions?: number
  /** Выключать во время кино-тура, чтобы не засорять кадр. */
  enabled?: boolean
}

/**
 * Живые push-уведомления поверх карты: «📍 WA 12345 dojeżdża do Berlin».
 * События берём из детерминированной ленты симулятора (campaignFeed) — то же,
 * что в отчёте, но всплывающими пилюлями. Тик по реальному времени → на 60× льётся поток.
 */
export function LiveToasts({ trucks, impressions, enabled = true }: Props) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const trucksRef = useRef(trucks)
  const enabledRef = useRef(enabled)
  const impRef = useRef(impressions)
  trucksRef.current = trucks
  enabledRef.current = enabled
  impRef.current = impressions

  const idRef = useRef(0)
  const cooldown = useRef(new Map<string, number>())
  const timers = useRef<number[]>([])

  useEffect(() => {
    const pop = () => {
      if (!enabledRef.current || trucksRef.current.length === 0) return
      const feed = campaignFeed(trucksRef.current, impRef.current ?? 0, simNow())
      const t = performance.now()
      for (const [k, exp] of cooldown.current) if (exp < t) cooldown.current.delete(k)
      const ev = feed.find((e) => !cooldown.current.has(keyOf(e)))
      if (!ev) return
      cooldown.current.set(keyOf(ev), t + 45_000)
      const id = ++idRef.current
      setToasts((prev) => [...prev.slice(-2), { id, kind: ev.kind, text: ev.text, sub: ev.sub }])
      const timer = window.setTimeout(
        () => setToasts((prev) => prev.filter((x) => x.id !== id)),
        5200,
      )
      timers.current.push(timer)
    }
    const first = window.setTimeout(pop, 1500)
    const iv = window.setInterval(pop, 3800)
    return () => {
      clearTimeout(first)
      clearInterval(iv)
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [])

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-[264px] z-[70] mx-auto flex max-w-md flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="flex max-w-full items-center gap-2.5 rounded-full border border-line bg-surface/90 py-1.5 pr-4 pl-2 shadow-[0_14px_34px_-12px_rgb(0_0_0_/_0.85)] backdrop-blur-xl"
          >
            <span className={`grid size-7 flex-none place-items-center rounded-full text-[13px] ${ICON_BG[t.kind]}`}>
              {EMOJI[t.kind]}
            </span>
            <span className="truncate text-[12.5px] font-medium text-ink">{t.text}</span>
            <span className="flex-none font-mono text-[10.5px] text-ink-faint">{t.sub}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
