/** Форматирование чисел/валюты и польские plural-формы. Всё через Intl('pl-PL'), без библиотек. */

const plNumber = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 })
const plCurrency = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
const plOneDecimal = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

/** 1234567 → «1 234 567» (неразрывные пробелы группами). */
export function formatNumber(value: number): string {
  return plNumber.format(value)
}

/** 450000 → «450 000 zł». */
export function formatPln(value: number): string {
  return plCurrency.format(value)
}

/** 5 230 000 → «5,2 mln». */
export function formatMln(value: number): string {
  return `${plOneDecimal.format(value / 1_000_000)} mln`
}

/** 4.7M и 8.8M → «4,7–8,8 mln» (для «zasięg X–Y mln»). */
export function formatMlnRange(min: number, max: number): string {
  return `${plOneDecimal.format(min / 1_000_000)}–${plOneDecimal.format(max / 1_000_000)} mln`
}

const plDate = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })

/** '2026-05-01' → «1 maj 2026». Вход — ISO YYYY-MM-DD (парсится в UTC). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return plDate.format(new Date(Date.UTC(y, m - 1, d)))
}

export interface PluralForms {
  /** 1 naczepa */
  one: string
  /** 2–4 naczepy (кроме 12–14) */
  few: string
  /** 5+ naczep */
  many: string
}

/** Польские правила множественного числа: 1 → one; 2–4 вне 12–14 → few; иначе many. */
export function plPlural(n: number, forms: PluralForms): string {
  const abs = Math.abs(n)
  if (abs === 1) return forms.one
  const mod10 = abs % 10
  const mod100 = abs % 100
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return forms.few
  return forms.many
}
