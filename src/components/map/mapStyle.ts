import type { StyleSpecification } from 'maplibre-gl'

/** В E2E (VITE_E2E=1) тайлы не грузим — WebGL в headless-CI не рендерит растр; ассерты идут через debug-хук. */
export const IS_E2E = import.meta.env.VITE_E2E === '1'

export type MapTheme = 'light' | 'dark'

/** OpenFreeMap — векторные тайлы без ключа и лимитов. Liberty (свет) / Dark (mission-control). */
export const OPENFREEMAP_LIGHT = 'https://tiles.openfreemap.org/styles/liberty'
export const OPENFREEMAP_DARK = 'https://tiles.openfreemap.org/styles/dark'

/** Пустой валидный стиль для E2E: только фон, без сети. */
export const emptyStyle = (theme: MapTheme): StyleSpecification => ({
  version: 8,
  sources: {},
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': theme === 'dark' ? '#0a0e14' : '#e6ecf2' } },
  ],
})

export const mapStyle = (theme: MapTheme = 'light'): string | StyleSpecification =>
  IS_E2E ? emptyStyle(theme) : theme === 'dark' ? OPENFREEMAP_DARK : OPENFREEMAP_LIGHT

/** Цвета стрелок-фур по теме: [едет, стоит]. */
export const ARROW_COLORS: Record<MapTheme, { driving: string; parked: string }> = {
  light: { driving: '#1e3a8a', parked: '#94a3b8' },
  dark: { driving: '#a3e635', parked: '#5c6b82' },
}

/** Границы Европы для начального fitBounds ([W,S], [E,N]). */
export const EUROPE_BOUNDS: [[number, number], [number, number]] = [
  [-9.5, 36],
  [28, 58.5],
]

/**
 * Иконка-стрелка (шеврон вверх = север) для symbol-слоя с icon-rotate по bearing.
 * Рисуется на canvas в браузере; в SSR/тестах не вызывается.
 */
export function makeArrowIcon(size = 36, color = '#1e40af', ring = '#ffffff'): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const c = size / 2
  ctx.translate(c, c)
  ctx.beginPath()
  ctx.moveTo(0, -size * 0.34) // нос
  ctx.lineTo(size * 0.26, size * 0.3)
  ctx.lineTo(0, size * 0.14) // выемка сзади
  ctx.lineTo(-size * 0.26, size * 0.3)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.strokeStyle = ring
  ctx.lineWidth = size * 0.06
  ctx.lineJoin = 'round'
  ctx.fill()
  ctx.stroke()
  return canvas
}
