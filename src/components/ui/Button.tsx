import { motion } from 'framer-motion'
import type { ComponentPropsWithoutRef } from 'react'

type Variant = 'cta' | 'primary' | 'secondary' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  cta: 'bg-cta text-white hover:bg-cta-strong shadow-card',
  primary: 'bg-brand text-white hover:bg-brand-strong shadow-card',
  secondary: 'bg-brand-soft text-brand hover:bg-brand/15',
  ghost: 'text-ink-muted hover:bg-canvas',
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
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold transition-colors disabled:opacity-40 ${
        full ? 'w-full' : ''
      } ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
