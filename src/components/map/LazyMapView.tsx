import { lazy, Suspense } from 'react'
import type { MapViewProps } from './MapView'

// maplibre-gl тяжёлый — грузим карту отдельным чанком, только когда она нужна.
const MapView = lazy(() => import('./MapView').then((m) => ({ default: m.MapView })))

function MapSkeleton({ dark }: { dark?: boolean }) {
  return (
    <div className={`grid size-full place-items-center ${dark ? 'bg-[#0a0e14]' : 'bg-[#e6ecf2]'}`}>
      <span className="text-sm text-ink-muted">Ładowanie mapy…</span>
    </div>
  )
}

export function LazyMapView(props: MapViewProps) {
  return (
    <Suspense fallback={<MapSkeleton dark={props.theme === 'dark'} />}>
      <MapView {...props} />
    </Suspense>
  )
}
