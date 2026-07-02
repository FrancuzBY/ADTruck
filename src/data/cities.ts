/** Пины городов для mini-карты покрытия в визарде (названия — по-польски, как в маршрутах). */
export interface CityPin {
  name: string
  lng: number
  lat: number
  /** Хабы PL рисуем крупнее */
  hub?: boolean
}

export const CITIES: CityPin[] = [
  { name: 'Warszawa', lng: 21.0122, lat: 52.2297, hub: true },
  { name: 'Poznań', lng: 16.9252, lat: 52.4064, hub: true },
  { name: 'Gdańsk', lng: 18.6466, lat: 54.352, hub: true },
  { name: 'Katowice', lng: 19.0238, lat: 50.2649, hub: true },
  { name: 'Wrocław', lng: 17.0385, lat: 51.1079, hub: true },
  { name: 'Łódź', lng: 19.456, lat: 51.7592, hub: true },
  { name: 'Kraków', lng: 19.945, lat: 50.0647, hub: true },
  { name: 'Szczecin', lng: 14.5528, lat: 53.4285, hub: true },
  { name: 'Białystok', lng: 23.1688, lat: 53.1325 },
  { name: 'Olsztyn', lng: 20.4801, lat: 53.7784 },
  { name: 'Berlin', lng: 13.405, lat: 52.52 },
  { name: 'Hamburg', lng: 9.9937, lat: 53.5511 },
  { name: 'Hannover', lng: 9.732, lat: 52.3759 },
  { name: 'Drezno', lng: 13.7373, lat: 51.0504 },
  { name: 'Frankfurt', lng: 8.6821, lat: 50.1109 },
  { name: 'Kolonia', lng: 6.9603, lat: 50.9375 },
  { name: 'Dortmund', lng: 7.4653, lat: 51.5136 },
  { name: 'Duisburg', lng: 6.7623, lat: 51.4344 },
  { name: 'Norymberga', lng: 11.0767, lat: 49.4521 },
  { name: 'Erfurt', lng: 11.0299, lat: 50.9848 },
  { name: 'Monachium', lng: 11.582, lat: 48.1351 },
  { name: 'Rotterdam', lng: 4.4777, lat: 51.9244 },
  { name: 'Amsterdam', lng: 4.9041, lat: 52.3676 },
  { name: 'Utrecht', lng: 5.1214, lat: 52.0907 },
  { name: 'Antwerpia', lng: 4.4025, lat: 51.2194 },
  { name: 'Liège', lng: 5.5797, lat: 50.6326 },
  { name: 'Paryż', lng: 2.3522, lat: 48.8566 },
  { name: 'Lyon', lng: 4.8357, lat: 45.764 },
  { name: 'Miluza', lng: 7.3389, lat: 47.7508 },
  { name: 'Praga', lng: 14.4378, lat: 50.0755 },
  { name: 'Brno', lng: 16.6068, lat: 49.1951 },
  { name: 'Ostrawa', lng: 18.2625, lat: 49.8209 },
  { name: 'Wiedeń', lng: 16.3738, lat: 48.2082 },
  { name: 'Villach', lng: 13.8506, lat: 46.6111 },
  { name: 'Bratysława', lng: 17.1077, lat: 48.1486 },
  { name: 'Żylina', lng: 18.7408, lat: 49.2231 },
  { name: 'Budapeszt', lng: 19.0402, lat: 47.4979 },
  { name: 'Kowno', lng: 23.9036, lat: 54.8985 },
  { name: 'Wilno', lng: 25.2797, lat: 54.6872 },
  { name: 'Ryga', lng: 24.1052, lat: 56.9496 },
  { name: 'Mediolan', lng: 9.19, lat: 45.4642 },
  { name: 'Saragossa', lng: -0.8891, lat: 41.6488 },
  { name: 'Madryt', lng: -3.7038, lat: 40.4168 },
  { name: 'Barcelona', lng: 2.1734, lat: 41.3851 },
]
