import { motion } from 'framer-motion'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  /** Форматирует значение для крупного дисплея (напр. formatPln). */
  format?: (value: number) => string
  /** Подпись под слайдером (напр. «do 50 naczep»). */
  hint?: string
}

export function Slider({ label, value, min, max, step = 1, onChange, format, hint }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100
  const track = `linear-gradient(to right, var(--color-brand) ${pct}%, var(--color-line) ${pct}%)`

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink-muted">{label}</span>
        <motion.span
          key={value}
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="text-lg font-bold text-ink tabular-nums"
        >
          {format ? format(value) : value}
        </motion.span>
      </div>
      <input
        type="range"
        className="adt-range mt-3"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ background: track }}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
      {hint && <p className="mt-2 text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}
