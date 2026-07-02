/** Работа с датами кампаний. Только UTC — никаких сдвигов от локальной таймзоны. */

/** 'YYYY-MM-DD' → Date на полночь UTC. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Дней в диапазоне, обе даты включительно: 2026-05-01..2026-07-31 → 92. */
export function daysInclusive(startISO: string, endISO: string): number {
  return Math.round((parseISODate(endISO).getTime() - parseISODate(startISO).getTime()) / DAY_MS) + 1
}

/**
 * Длительность кампании в месяцах.
 *
 * Если диапазон покрывает целые календарные месяцы (условие: день месяца у
 * «конец + 1 день» совпадает с днём старта), возвращаем точное целое —
 * так фикстура 01.05–31.07 даёт ровно 3 и цена сходится с мокапом без дрейфа.
 * Иначе — дробные месяцы как days/30.
 */
export function campaignMonths(startISO: string, endISO: string): number {
  const start = parseISODate(startISO)
  const endExclusive = new Date(parseISODate(endISO).getTime() + DAY_MS)
  if (start.getUTCDate() === endExclusive.getUTCDate()) {
    return (
      (endExclusive.getUTCFullYear() - start.getUTCFullYear()) * 12 +
      (endExclusive.getUTCMonth() - start.getUTCMonth())
    )
  }
  return daysInclusive(startISO, endISO) / 30
}
