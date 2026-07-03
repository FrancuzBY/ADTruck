import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  url: string
  title: string
  subtitle?: string
  onClose: () => void
}

/** Модалка «Zobacz na żywo»: QR-код на живую карту/отчёт — клиент сканирует телефоном. */
export function ShareLiveModal({ url, title, subtitle, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const pretty = url.replace(/^https?:\/\//, '')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard может быть недоступен */ }
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="relative w-full max-w-[320px] overflow-hidden rounded-[26px] border border-line bg-surface p-6 shadow-[0_30px_80px_-20px_rgb(0_0_0_/_0.9)]"
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-live/30 bg-live/10 px-2.5 py-1 text-[11px] font-semibold text-live">
            <span className="size-1.5 animate-[softpulse_1.6s_ease-in-out_infinite] rounded-full bg-live shadow-[0_0_8px_var(--color-live)]" />
            Na żywo
          </span>
          <button type="button" onClick={onClose} aria-label="Zamknij" className="grid size-8 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <h2 className="mt-3 font-display text-[19px] font-extrabold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-[13px] leading-snug text-ink-muted">{subtitle}</p>}

        {/* QR на светлом фоне — так лучше сканируется */}
        <div className="mt-4 flex justify-center">
          <div className="rounded-[20px] bg-white p-4 shadow-[0_12px_30px_-12px_rgb(0_0_0_/_0.6)]">
            <QRCodeSVG value={url} size={188} level="M" bgColor="#ffffff" fgColor="#0a0e14" />
          </div>
        </div>

        <p className="mt-4 text-center text-[13px] font-medium text-ink">
          Zeskanuj telefonem, aby otworzyć podgląd na żywo
        </p>
        <p className="mt-1 truncate text-center font-mono text-[11px] text-ink-faint">{pretty}</p>

        <button
          type="button"
          onClick={copy}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface-2 py-3 text-[13.5px] font-semibold text-ink transition-colors hover:bg-surface"
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-live)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M20 6 9 17l-5-5" /></svg>
              Skopiowano
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="size-4"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
              Kopiuj link
            </>
          )}
        </button>
      </motion.div>
    </div>,
    document.body,
  )
}
