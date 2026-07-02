import { describe, expect, it } from 'vitest'
import { formatMln, formatMlnRange, formatNumber, formatPln, plPlural } from './format'

/** Intl для pl-PL использует NBSP/узкий NBSP — для сравнения приводим к обычному пробелу. */
const norm = (s: string) => s.replace(/[  ]/g, ' ')

describe('formatPln', () => {
  it('450000 → «450 000 zł»', () => {
    expect(norm(formatPln(450_000))).toBe('450 000 zł')
  })

  it('30000 → «30 000 zł»', () => {
    expect(norm(formatPln(30_000))).toBe('30 000 zł')
  })
})

describe('formatNumber', () => {
  it('группирует разряды по-польски', () => {
    expect(norm(formatNumber(1_234_567))).toBe('1 234 567')
  })
})

describe('formatMln', () => {
  it('5230000 → «5,2 mln» (десятичная запятая)', () => {
    expect(norm(formatMln(5_230_000))).toBe('5,2 mln')
  })

  it('целые миллионы без хвоста: 6000000 → «6 mln»', () => {
    expect(norm(formatMln(6_000_000))).toBe('6 mln')
  })

  it('диапазон: «4,7–8,8 mln»', () => {
    expect(norm(formatMlnRange(4_725_000, 8_775_000))).toBe('4,7–8,8 mln')
  })
})

describe('plPlural', () => {
  const naczepa = { one: 'naczepa', few: 'naczepy', many: 'naczep' }

  it.each([
    [1, 'naczepa'],
    [2, 'naczepy'],
    [4, 'naczepy'],
    [5, 'naczep'],
    [11, 'naczep'],
    [12, 'naczep'],
    [14, 'naczep'],
    [22, 'naczepy'],
    [104, 'naczepy'],
    [112, 'naczep'],
    [122, 'naczepy'],
  ])('%i → %s', (n, expected) => {
    expect(plPlural(n, naczepa)).toBe(expected)
  })
})
