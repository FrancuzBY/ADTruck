/**
 * Closed-form одометр: пробег — чистая функция времени, без тиков-накопителей.
 * Монотонный и аддитивный (km(a,c) = km(a,b) + km(b,c)), поэтому фуры «живут»
 * между сессиями, а отчётный километраж не дрейфует.
 *
 * Суточный цикл по нормам ЕС (упрощённо, все окна в UTC):
 *   06:00–10:30 езда (4,5 ч) → 45 мин пауза → 11:15–15:45 езда (4,5 ч) → отдых.
 * Воскресенье — стоим (запреты движения TIR в PL/DE). Итого ~675 км/день, 6 дней в неделю.
 */

export const BASE_SPEED_KMH = 75
/** 9 часов езды в день. */
export const DAY_DRIVING_MINUTES = 540
/** Понедельник 2024-01-01 00:00 UTC — якорь недельного цикла (день 0 = понедельник). */
export const SIM_EPOCH_MS = Date.UTC(2024, 0, 1)

const DAY_MS = 24 * 60 * 60 * 1000
const DRIVE_A_START = 6 * 60
const DRIVE_A_END = 10.5 * 60
const DRIVE_B_START = 11.25 * 60
const DRIVE_B_END = 15.75 * 60

/** Минут за рулём с начала суток к моменту minuteOfDay (кусочно-линейная, 0..540). */
export function drivenMinutesAtTimeOfDay(minuteOfDay: number): number {
  if (minuteOfDay <= DRIVE_A_START) return 0
  if (minuteOfDay <= DRIVE_A_END) return minuteOfDay - DRIVE_A_START
  if (minuteOfDay <= DRIVE_B_START) return DRIVE_A_END - DRIVE_A_START
  if (minuteOfDay <= DRIVE_B_END) return DRIVE_A_END - DRIVE_A_START + (minuteOfDay - DRIVE_B_START)
  return DAY_DRIVING_MINUTES
}

/** День воскресный? dayIndex — дни от SIM_EPOCH (день 0 — понедельник). */
const isSunday = (dayIndex: number) => ((dayIndex % 7) + 7) % 7 === 6

/** Ездовых дней среди первых dayIndex дней от эпохи (без текущего). */
function drivingDaysBefore(dayIndex: number): number {
  const fullWeeks = Math.floor(dayIndex / 7)
  const rem = dayIndex - fullWeeks * 7
  return fullWeeks * 6 + Math.min(rem, 6)
}

/** Километров проехано с SIM_EPOCH к моменту tMs (t ≥ эпохи; скорость 75 × speedFactor). */
export function odometerKm(tMs: number, speedFactor: number): number {
  const sinceEpoch = tMs - SIM_EPOCH_MS
  const dayIndex = Math.floor(sinceEpoch / DAY_MS)
  const minuteOfDay = (sinceEpoch - dayIndex * DAY_MS) / 60_000
  const minutesToday = isSunday(dayIndex) ? 0 : drivenMinutesAtTimeOfDay(minuteOfDay)
  const totalMinutes = drivingDaysBefore(dayIndex) * DAY_DRIVING_MINUTES + minutesToday
  return (totalMinutes / 60) * BASE_SPEED_KMH * speedFactor
}

/** Точный пробег за интервал — для отчётов кампаний. */
export function kmInInterval(t0Ms: number, t1Ms: number, speedFactor: number): number {
  return odometerKm(t1Ms, speedFactor) - odometerKm(t0Ms, speedFactor)
}

/** Фура сейчас в движении? (в ездовом окне и не воскресенье) */
export function isDrivingAt(tMs: number): boolean {
  const sinceEpoch = tMs - SIM_EPOCH_MS
  const dayIndex = Math.floor(sinceEpoch / DAY_MS)
  if (isSunday(dayIndex)) return false
  const m = (sinceEpoch - dayIndex * DAY_MS) / 60_000
  return (m >= DRIVE_A_START && m < DRIVE_A_END) || (m >= DRIVE_B_START && m < DRIVE_B_END)
}

/** Начало UTC-суток для tMs (для «km dzisiaj»). */
export function startOfUTCDay(tMs: number): number {
  return tMs - (((tMs - SIM_EPOCH_MS) % DAY_MS) + DAY_MS) % DAY_MS
}
