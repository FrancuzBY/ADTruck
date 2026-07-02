import { describe, expect, it } from 'vitest'
import { pl } from './pl'

describe('pl dictionary', () => {
  it('has all bottom-nav labels', () => {
    expect(pl.nav.start).toBeTruthy()
    expect(pl.nav.mapa).toBeTruthy()
    expect(pl.nav.kampanie).toBeTruthy()
    expect(pl.nav.flota).toBeTruthy()
    expect(pl.nav.profil).toBeTruthy()
  })

  it('uses Polish diacritics in copy (sanity that texts are real Polish)', () => {
    const all = JSON.stringify(pl)
    expect(all).toMatch(/[ąćęłńóśźż]/i)
  })
})
