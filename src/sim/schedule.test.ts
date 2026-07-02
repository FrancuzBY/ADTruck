import { describe, expect, it } from 'vitest'
import {
  DAY_DRIVING_MINUTES,
  drivenMinutesAtTimeOfDay,
  isDrivingAt,
  kmInInterval,
  odometerKm,
  SIM_EPOCH_MS,
  startOfUTCDay,
} from './schedule'

const HOUR = 3_600_000
const DAY = 24 * HOUR
/** Понедельник 2026-06-29 00:00 UTC (эпоха 2024-01-01 — тоже понедельник). */
const MONDAY = Date.UTC(2026, 5, 29)
const SUNDAY = Date.UTC(2026, 6, 5)

describe('drivenMinutesAtTimeOfDay', () => {
  it('до 06:00 — ноль, после 15:45 — все 540', () => {
    expect(drivenMinutesAtTimeOfDay(0)).toBe(0)
    expect(drivenMinutesAtTimeOfDay(6 * 60)).toBe(0)
    expect(drivenMinutesAtTimeOfDay(16 * 60)).toBe(DAY_DRIVING_MINUTES)
    expect(drivenMinutesAtTimeOfDay(24 * 60)).toBe(DAY_DRIVING_MINUTES)
  })

  it('пауза 10:30–11:15 не добавляет километров', () => {
    expect(drivenMinutesAtTimeOfDay(10.5 * 60)).toBe(270)
    expect(drivenMinutesAtTimeOfDay(11.25 * 60)).toBe(270)
    expect(drivenMinutesAtTimeOfDay(11 * 60)).toBe(270)
  })
})

describe('odometerKm', () => {
  it('полный ездовой день ≈ 675 км при factor 1', () => {
    expect(kmInInterval(MONDAY, MONDAY + DAY, 1)).toBeCloseTo(675, 6)
  })

  it('воскресенье — ноль', () => {
    expect(kmInInterval(SUNDAY, SUNDAY + DAY, 1)).toBe(0)
    expect(isDrivingAt(SUNDAY + 8 * HOUR)).toBe(false)
  })

  it('неделя = 6 × 675 = 4050 км', () => {
    expect(kmInInterval(MONDAY, MONDAY + 7 * DAY, 1)).toBeCloseTo(4050, 6)
  })

  it('монотонность по времени', () => {
    let prev = odometerKm(MONDAY, 1)
    for (let h = 1; h <= 48; h++) {
      const cur = odometerKm(MONDAY + h * HOUR, 1)
      expect(cur).toBeGreaterThanOrEqual(prev)
      prev = cur
    }
  })

  it('аддитивность: km(a,c) = km(a,b) + km(b,c) точно', () => {
    const a = MONDAY + 7 * HOUR
    const b = MONDAY + 26 * HOUR
    const c = MONDAY + 3 * DAY + 13 * HOUR
    expect(kmInInterval(a, b, 1.07) + kmInInterval(b, c, 1.07)).toBeCloseTo(
      kmInInterval(a, c, 1.07),
      9,
    )
  })

  it('speedFactor масштабирует пробег линейно', () => {
    const base = kmInInterval(MONDAY, MONDAY + DAY, 1)
    expect(kmInInterval(MONDAY, MONDAY + DAY, 1.1)).toBeCloseTo(base * 1.1, 9)
  })

  it('окна движения: едем в 08:00, стоим в 11:00 и в 20:00', () => {
    expect(isDrivingAt(MONDAY + 8 * HOUR)).toBe(true)
    expect(isDrivingAt(MONDAY + 11 * HOUR)).toBe(false)
    expect(isDrivingAt(MONDAY + 20 * HOUR)).toBe(false)
  })
})

describe('startOfUTCDay', () => {
  it('обнуляет время внутри суток', () => {
    expect(startOfUTCDay(MONDAY + 13 * HOUR + 123)).toBe(MONDAY)
    expect(startOfUTCDay(MONDAY)).toBe(MONDAY)
  })

  it('эпоха выровнена по понедельнику', () => {
    expect(new Date(SIM_EPOCH_MS).getUTCDay()).toBe(1)
  })
})
