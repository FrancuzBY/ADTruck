import { useMemo } from 'react'
import { MapView } from '../components/map/MapView'
import { SpeedControl } from '../components/map/SpeedControl'
import { pl } from '../i18n/pl'
import { allTrucks, useFleetStore } from '../store/fleet'

export function Mapa() {
  const userTrucks = useFleetStore((s) => s.userTrucks)
  // getTrucks стабилен между рендерами; при добавлении фуры меняется fleetKey → карта пересоздаётся
  const trucks = useMemo(() => allTrucks(userTrucks), [userTrucks])
  const getTrucks = useMemo(() => () => trucks, [trucks])

  return (
    <div className="fixed inset-x-0 top-0 bottom-16 z-0 mx-auto max-w-md">
      <MapView getTrucks={getTrucks} fleetKey={userTrucks.length} />
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span className="rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-white shadow-card">
          {pl.mapa.title}
        </span>
        <SpeedControl />
      </div>
    </div>
  )
}
