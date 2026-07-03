import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef } from 'react'
import { routeById } from '../../data/routes'
import type { Truck } from '../../domain/types'
import { createSimEngine } from '../../sim/engine'
import type { TruckFeatureCollection } from '../../sim/features'
import { routeGeometry } from '../../sim/simulator'
import { ARROW_COLORS, EUROPE_BOUNDS, IS_E2E, makeArrowIcon, mapStyle, type MapTheme } from './mapStyle'

const SOURCE_ID = 'trucks'
const SEL_ID = 'sel'
const HEAT_ID = 'heat'
const COLS_ID = 'cols'
const ARROW_DRIVING = 'truck-arrow'
const ARROW_PARKED = 'truck-arrow-parked'
const EMPTY_FC: TruckFeatureCollection = { type: 'FeatureCollection', features: [] }
const EMPTY_GEO: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }

declare global {
  interface Window {
    __adtruckDebug?: { count: number; features: TruckFeatureCollection['features'] }
  }
}

export interface MapViewProps {
  getTrucks: () => Truck[]
  fleetKey?: string | number
  interactive?: boolean
  theme?: MapTheme
  /** Клик по фуре: подсветка маршрута (пройдено/осталось) + колбэк с id. */
  onSelectTruck?: (id: string) => void
  /** Точки городов с весом 0..1 для тепловой карты охвата. */
  heatmap?: GeoJSON.FeatureCollection
  /** Показывать тепловую карту. */
  showHeatmap?: boolean
  /** Полигоны-колонны городов для 3D-режима. */
  columns?: GeoJSON.FeatureCollection
  /** 3D-режим: наклон + объёмные колонны охвата. */
  show3d?: boolean
  /** Отдаёт готовый maplibre.Map наружу (для кино-автотура). */
  onMapReady?: (map: maplibregl.Map) => void
}

/** Full-bleed карта Европы: symbol-слой флота + heatmap охвата + подсветка выбранного маршрута. */
export function MapView({ getTrucks, fleetKey, interactive = true, theme = 'dark', onSelectTruck, heatmap, showHeatmap, columns, show3d, onMapReady }: MapViewProps) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const loadedRef = useRef(false)
  const onSelectRef = useRef(onSelectTruck)
  const heatRef = useRef(heatmap)
  const showHeatRef = useRef(showHeatmap)
  const colsRef = useRef(columns)
  const show3dRef = useRef(show3d)
  const onReadyRef = useRef(onMapReady)
  onSelectRef.current = onSelectTruck
  heatRef.current = heatmap
  showHeatRef.current = showHeatmap
  colsRef.current = columns
  show3dRef.current = show3d
  onReadyRef.current = onMapReady

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
    mapRef.current = map
    if (interactive) map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    let engine: ReturnType<typeof createSimEngine> | null = null

    const setData = (fc: TruckFeatureCollection) => {
      ;(map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined)?.setData(fc)
      if (IS_E2E) window.__adtruckDebug = { count: fc.features.length, features: fc.features }
    }
    const clearSel = () =>
      (map.getSource(SEL_ID) as maplibregl.GeoJSONSource | undefined)?.setData(EMPTY_GEO)

    const revealRoute = (truckId: string, clng: number, clat: number) => {
      try {
        const truck = getTrucks().find((t) => t.id === truckId)
        const route = truck && routeById(truck.routeId)
        if (!route) return
        const pts = routeGeometry(route).points
        if (pts.length < 2) return
        let idx = 0
        let best = Infinity
        for (let i = 0; i < pts.length; i++) {
          const dd = (pts[i][0] - clng) ** 2 + (pts[i][1] - clat) ** 2
          if (dd < best) { best = dd; idx = i }
        }
        const coords = (a: number, b?: number): number[][] => pts.slice(a, b)
        const fc: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', properties: { seg: 'rem' }, geometry: { type: 'LineString', coordinates: coords(idx) } },
            { type: 'Feature', properties: { seg: 'trav' }, geometry: { type: 'LineString', coordinates: coords(0, idx + 1) } },
            { type: 'Feature', properties: { pt: 'o' }, geometry: { type: 'Point', coordinates: pts[0] } },
            { type: 'Feature', properties: { pt: 'd' }, geometry: { type: 'Point', coordinates: pts[pts.length - 1] } },
          ],
        }
        ;(map.getSource(SEL_ID) as maplibregl.GeoJSONSource | undefined)?.setData(fc)
      } catch {
        /* подсветка маршрута не критична */
      }
    }

    map.on('load', () => {
      if (!IS_E2E) {
        map.addImage(ARROW_DRIVING, makeArrowIcon(36, arrow.driving).getContext('2d')!.getImageData(0, 0, 36, 36))
        map.addImage(ARROW_PARKED, makeArrowIcon(36, arrow.parked).getContext('2d')!.getImageData(0, 0, 36, 36))
      }

      // Тепловая карта охвата — самый нижний слой.
      map.addSource(HEAT_ID, { type: 'geojson', data: heatRef.current ?? EMPTY_GEO })
      map.addLayer({
        id: HEAT_ID,
        type: 'heatmap',
        source: HEAT_ID,
        layout: { visibility: showHeatRef.current ? 'visible' : 'none' },
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 0.5, 0.35, 1, 0.85],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 3, 0.35, 6, 0.9],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 3, 13, 6, 28],
          'heatmap-opacity': 0.8,
          'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(6,9,15,0)',
            0.18, 'rgba(34,211,238,0.32)',
            0.42, 'rgba(34,211,238,0.62)',
            0.62, 'rgba(163,230,53,0.72)',
            0.82, 'rgba(245,158,11,0.85)',
            1, 'rgba(249,115,22,0.95)'],
        },
      })

      // 3D-колонны охвата (fill-extrusion) — под фурами.
      map.addSource(COLS_ID, { type: 'geojson', data: colsRef.current ?? EMPTY_GEO })
      map.addLayer({
        id: COLS_ID,
        type: 'fill-extrusion',
        source: COLS_ID,
        layout: { visibility: show3dRef.current ? 'visible' : 'none' },
        paint: {
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.85,
          'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'weight'],
            0, '#155e75', 0.4, '#22d3ee', 0.7, '#a3e635', 1, '#f59e0b'],
        },
      })

      // Подсветка выбранного маршрута — над heatmap, под фурами.
      map.addSource(SEL_ID, { type: 'geojson', data: EMPTY_GEO })
      map.addLayer({ id: 'sel-rem', type: 'line', source: SEL_ID, filter: ['==', ['get', 'seg'], 'rem'], layout: { 'line-cap': 'round' }, paint: { 'line-color': '#22d3ee', 'line-width': 2.5, 'line-dasharray': [1.5, 1.5], 'line-opacity': 0.85 } })
      map.addLayer({ id: 'sel-trav', type: 'line', source: SEL_ID, filter: ['==', ['get', 'seg'], 'trav'], layout: { 'line-cap': 'round' }, paint: { 'line-color': '#a3e635', 'line-width': 3.5, 'line-opacity': 0.95 } })
      map.addLayer({ id: 'sel-pts', type: 'circle', source: SEL_ID, filter: ['has', 'pt'], paint: { 'circle-radius': 5, 'circle-color': ['case', ['==', ['get', 'pt'], 'o'], '#a3e635', '#22d3ee'], 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.5 } })

      map.addSource(SOURCE_ID, { type: 'geojson', data: EMPTY_FC })
      if (IS_E2E) {
        map.addLayer({ id: 'trucks-layer', type: 'circle', source: SOURCE_ID, paint: { 'circle-radius': 4, 'circle-color': ['case', ['get', 'isDriving'], arrow.driving, arrow.parked] } })
      } else {
        map.addLayer({
          id: 'trucks-layer', type: 'symbol', source: SOURCE_ID,
          layout: { 'icon-image': ['case', ['get', 'isDriving'], ARROW_DRIVING, ARROW_PARKED], 'icon-rotate': ['get', 'bearing'], 'icon-rotation-alignment': 'map', 'icon-allow-overlap': true, 'icon-size': 0.6 },
        })
      }

      if (interactive) {
        map.on('click', 'trucks-layer', (e) => {
          const f = e.features?.[0]
          if (!f) return
          const id = String((f.properties as Record<string, unknown>).id)
          const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates as [number, number]
          revealRoute(id, lng, lat)
          onSelectRef.current?.(id)
        })
        map.on('click', (e) => {
          if (!map.queryRenderedFeatures(e.point, { layers: ['trucks-layer'] }).length) clearSel()
        })
        map.on('mouseenter', 'trucks-layer', () => (map.getCanvas().style.cursor = 'pointer'))
        map.on('mouseleave', 'trucks-layer', () => (map.getCanvas().style.cursor = ''))
      }

      engine = createSimEngine(getTrucks, setData)
      engine.start()
      loadedRef.current = true
      onReadyRef.current?.(map)
    })

    return () => {
      engine?.stop()
      loadedRef.current = false
      mapRef.current = null
      map.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fleetKey, interactive, theme])

  // Живое обновление данных heatmap без пересоздания карты.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    ;(map.getSource(HEAT_ID) as maplibregl.GeoJSONSource | undefined)?.setData(heatmap ?? EMPTY_GEO)
  }, [heatmap])

  // Тумблер видимости heatmap.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current || !map.getLayer(HEAT_ID)) return
    map.setLayoutProperty(HEAT_ID, 'visibility', showHeatmap ? 'visible' : 'none')
  }, [showHeatmap])

  // Данные 3D-колонн.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    ;(map.getSource(COLS_ID) as maplibregl.GeoJSONSource | undefined)?.setData(columns ?? EMPTY_GEO)
  }, [columns])

  // 3D-режим: наклон карты + видимость колонн.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current || !map.getLayer(COLS_ID)) return
    map.setLayoutProperty(COLS_ID, 'visibility', show3d ? 'visible' : 'none')
    map.easeTo({ pitch: show3d ? 55 : 0, bearing: show3d ? -18 : 0, duration: 800 })
  }, [show3d])

  return <div ref={container} className="size-full" data-testid="map" />
}
