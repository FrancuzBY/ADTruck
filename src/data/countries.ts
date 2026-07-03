/** ISO alpha-2 → польское название (только страны, встречающиеся в коридорах). */
export const COUNTRY_NAMES_PL: Record<string, string> = {
  PL: 'Polska',
  DE: 'Niemcy',
  NL: 'Holandia',
  BE: 'Belgia',
  FR: 'Francja',
  CZ: 'Czechy',
  AT: 'Austria',
  SK: 'Słowacja',
  HU: 'Węgry',
  LT: 'Litwa',
  LV: 'Łotwa',
  IT: 'Włochy',
  ES: 'Hiszpania',
}

export const countryNamePl = (code: string) => COUNTRY_NAMES_PL[code] ?? code

/** Родительный падеж (для «wjechała do …»). */
export const COUNTRY_GENITIVE_PL: Record<string, string> = {
  PL: 'Polski',
  DE: 'Niemiec',
  NL: 'Holandii',
  BE: 'Belgii',
  FR: 'Francji',
  CZ: 'Czech',
  AT: 'Austrii',
  SK: 'Słowacji',
  HU: 'Węgier',
  LT: 'Litwy',
  LV: 'Łotwy',
  IT: 'Włoch',
  ES: 'Hiszpanii',
}

export const countryGenitivePl = (code: string) => COUNTRY_GENITIVE_PL[code] ?? countryNamePl(code)
