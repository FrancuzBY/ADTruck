import { motion } from 'framer-motion'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  /** Форматирует значение для крупного дисплея и границ (напр. formatPln). */
  format?: (value: number) => string
  /** Подпись-пилюля под слайдером (напр. «Przy tym budżecie: do 50 naczep»). */
  hint?: string
}

export function Slider({ label, value, min, max, step = 1, onChange, format, hint }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100
  const track = `linear-gradient(to right, var(--color-brand) ${pct}%, var(--color-line) ${pct}%)`
  const fmt = (v: number) => (format ? format(v) : String(v))

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <motion.span
          key={value}
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="font-mono text-base font-semibold tabular-nums text-brand"
        >
          {fmt(value)}
        </motion.span>
      </div>
      <input
        type="range"
        className="adt-range mt-4"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ background: track }}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
      <div className="mt-2.5 flex justify-between font-mono text-[11px] text-ink-faint">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>
      {hint && (
        <p className="mt-3 rounded-[10px] bg-brand/8 px-3 py-2.5 text-[12.5px] font-medium text-brand">
          {hint}
        </p>
      )}
    </div>
  )
}
