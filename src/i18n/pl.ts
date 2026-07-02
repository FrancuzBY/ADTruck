/**
 * Единственный язык POC — польский. Лёгкий типизированный словарь вместо i18n-библиотеки.
 * Тексты пишем сразу нормальные (в отличие от гиббериша AI-мокапа).
 */
export const pl = {
  appName: 'AdTruck',
  tagline: 'Reklama, która jedzie przez Europę',
  nav: {
    start: 'Start',
    mapa: 'Mapa',
    kampanie: 'Kampanie',
    flota: 'Flota',
    profil: 'Profil',
  },
  roles: {
    advertiser: 'Reklamodawca',
    carrier: 'Przewoźnik',
  },
  landing: {
    heroTitle: 'Twoja reklama jedzie przez całą Europę',
    heroSubtitle:
      'Wynajmij powierzchnię reklamową na naczepach TIR i śledź zasięg swojej kampanii na żywo.',
    cta: 'Zamów kampanię',
    propGpsTitle: 'GPS na żywo',
    propGpsText: 'Każda naczepa z Twoją reklamą widoczna na mapie w czasie rzeczywistym.',
    propReachTitle: 'Zasięg w całej Europie',
    propReachText: 'Trasy przez 20+ krajów — od Warszawy po Madryt.',
    propReportsTitle: 'Raporty i statystyki',
    propReportsText: 'Przebieg, wyświetlenia i pokrycie kampanii w przejrzystych raportach.',
  },
  zamow: {
    title: 'Zamów kampanię',
    summaryTitle: 'Podsumowanie',
    confirmTitle: 'Potwierdzenie',
    next: 'Dalej',
    order: 'Zamawiam',
    placeholder: 'Kreator kampanii — wkrótce (etap M5).',
    confirmed: 'Kampania została utworzona!',
    goToMap: 'Zobacz mapę na żywo',
    goToCampaigns: 'Twoje kampanie',
  },
  mapa: {
    title: 'Mapa na żywo',
    placeholder: 'Mapa Europy z flotą naczep — wkrótce (etap M4).',
  },
  kampanie: {
    title: 'Twoje kampanie',
    empty: 'Nie masz jeszcze żadnej kampanii.',
    emptyCta: 'Zamów pierwszą kampanię',
  },
  flota: {
    title: 'Moja flota',
    placeholder: 'Lista naczep i dodawanie nowych — wkrótce (etap M6).',
  },
  profil: {
    title: 'Profil',
    roleLabel: 'Rola w demo',
    speedLabel: 'Prędkość symulacji',
    resetDemo: 'Resetuj demo',
    pwaHint: 'Dodaj AdTruck do ekranu głównego, aby korzystać jak z aplikacji.',
  },
} as const

export type PlDict = typeof pl
