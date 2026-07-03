import { motion } from 'framer-motion'
import type { ComponentPropsWithoutRef } from 'react'

type Variant = 'cta' | 'primary' | 'secondary' | 'ghost'

// Единый акцент действий — зелёный. primary === cta (кнопки одинаковые).
const GREEN = 'bg-cta text-white hover:bg-cta-strong shadow-[0_12px_30px_-10px_rgb(22_163_74_/_0.5)]'
const VARIANTS: Record<Variant, string> = {
  cta: GREEN,
  primary: GREEN,
  secondary: 'border border-line bg-surface-2 text-ink hover:bg-surface',
  ghost: 'text-ink-muted hover:text-ink',
}

interface ButtonProps extends ComponentPropsWithoutRef<typeof motion.button> {
  variant?: Variant
  full?: boolean
}

export function Button({ variant = 'primary', full, className = '', children, ...rest }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold transition-colors disabled:opacity-40 ${
        full ? 'w-full' : ''
      } ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
