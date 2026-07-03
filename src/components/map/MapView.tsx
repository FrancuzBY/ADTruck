import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef } from 'react'
import type { Truck } from '../../domain/types'
import { formatNumber } from '../../i18n/format'
import { createSimEngine } from '../../sim/engine'
import type { TruckFeatureCollection } from '../../sim/features'
import { ARROW_COLORS, EUROPE_BOUNDS, IS_E2E, makeArrowIcon, mapStyle, type MapTheme } from './mapStyle'

const SOURCE_ID = 'trucks'
const ARROW_DRIVING = 'truck-arrow'
const ARROW_PARKED = 'truck-arrow-parked'
const EMPTY_FC: TruckFeatureCollection = { type: 'FeatureCollection', features: [] }

declare global {
  interface Window {
    /** Debug-хук для e2e: число фур и позиции без чтения пикселей. */
    __adtruckDebug?: { count: number; features: TruckFeatureCollection['features'] }
  }
}

export interface MapViewProps {
  /** Флот для отрисовки (полный или отфильтрованный по кампании). */
  getTrucks: () => Truck[]
  /** Ключ, меняющийся при смене состава флота — пересоздаёт движок. */
  fleetKey?: string | number
  /** Интерактив (drag/zoom + nav-контрол). false — мини-карта покрытия в визарде. */
  interactive?: boolean
  /** Тема подложки: 'dark' для mission-control экранов (mapa, raport, flota). */
  theme?: MapTheme
}

/** Full-bleed карта Европы: один GeoJSON source + symbol-слой, обновление через setData. */
export function MapView({ getTrucks, fleetKey, interactive = true, theme = 'light' }: MapViewProps) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return
    const arrow = ARROW_COLORS[theme]
    const map = new maplibregl.Map({
      container: container.current,
      style: mapStyle(theme),
      bounds: EUROPE_BOUNDS,
      fitBoundsOptions: { padding: 24 },
      attributionControl: { compact: true },
      interactive,
    })
    if (interactive) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    }

    let engine: ReturnType<typeof createSimEngine> | null = null

    const publishDebug = (fc: TruckFeatureCollection) => {
      if (IS_E2E) window.__adtruckDebug = { count: fc.features.length, features: fc.features }
    }

    const setData = (fc: TruckFeatureCollection) => {
      const src = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
      src?.setData(fc)
      publishDebug(fc)
    }

    map.on('load', () => {
      if (!IS_E2E) {
        map.addImage(ARROW_DRIVING, makeArrowIcon(36, arrow.driving).getContext('2d')!.getImageData(0, 0, 36, 36))
        map.addImage(ARROW_PARKED, makeArrowIcon(36, arrow.parked).getContext('2d')!.getImageData(0, 0, 36, 36))
      }
      map.addSource(SOURCE_ID, { type: 'geojson', data: EMPTY_FC })

      if (IS_E2E) {
        // Без тайлов рисуем простые круги — достаточно, чтобы слой существовал.
        map.addLayer({
          id: 'trucks-layer',
          type: 'circle',
          source: SOURCE_ID,
          paint: { 'circle-radius': 4, 'circle-color': ['case', ['get', 'isDriving'], arrow.driving, arrow.parked] },
        })
      } else {
        map.addLayer({
          id: 'trucks-layer',
          type: 'symbol',
          source: SOURCE_ID,
          layout: {
            'icon-image': ['case', ['get', 'isDriving'], ARROW_DRIVING, ARROW_PARKED],
            'icon-rotate': ['get', 'bearing'],
            'icon-rotation-alignment': 'map',
            'icon-allow-overlap': true,
            'icon-size': 0.6,
          },
        })
      }

      const dark = theme === 'dark'
      const popup = new maplibregl.Popup({ closeButton: false, offset: 14 })
      map.on('click', 'trucks-layer', (e) => {
        const f = e.features?.[0]
        if (!f) return
        const p = f.properties as Record<string, unknown>
        const status = p.isDriving === true || p.isDriving === 'true'
          ? `w drodze · ${p.speedKmh} km/h`
          : 'postój'
        popup
          .setLngLat((f.geometry as GeoJSON.Point).coordinates as [number, number])
          .setHTML(
            `<div style="font:500 13px/1.4 'Geist Variable',sans-serif;color:${dark ? '#E7ECF5' : '#0f172a'}">
              <div style="font-weight:700">${p.plate}</div>
              <div style="color:${dark ? '#8A94A6' : '#64748b'}">${p.routeName}</div>
              <div style="margin-top:4px">${status}</div>
              <div style="color:${dark ? '#8A94A6' : '#64748b'}">dziś: ${formatNumber(Number(p.kmToday))} km</div>
            </div>`,
          )
          .addTo(map)
      })
      map.on('mouseenter', 'trucks-layer', () => (map.getCanvas().style.cursor = 'pointer'))
      map.on('mouseleave', 'trucks-layer', () => (map.getCanvas().style.cursor = ''))

      engine = createSimEngine(getTrucks, setData)
      engine.start()
    })

    return () => {
      engine?.stop()
      map.remove()
    }
    // fleetKey/theme пересоздают карту при смене состава флота или темы подложки
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fleetKey, interactive, theme])

  return <div ref={container} className="size-full" data-testid="map" />
}
