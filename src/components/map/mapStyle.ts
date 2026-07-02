import type { StyleSpecification } from 'maplibre-gl'

/** В E2E (VITE_E2E=1) тайлы не грузим — WebGL в headless-CI не рендерит растр; ассерты идут через debug-хук. */
export const IS_E2E = import.meta.env.VITE_E2E === '1'

/** OpenFreeMap Liberty — векторные тайлы без ключа и лимитов. */
export const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

/** Пустой валидный стиль для E2E: только фон, без сети. */
export const EMPTY_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#e6ecf2' } }],
}

export const mapStyle = (): string | StyleSpecification => (IS_E2E ? EMPTY_STYLE : OPENFREEMAP_STYLE)

/** Границы Европы для начального fitBounds ([W,S], [E,N]). */
export const EUROPE_BOUNDS: [[number, number], [number, number]] = [
  [-9.5, 36],
  [28, 58.5],
]

/**
 * Иконка-стрелка (шеврон вверх = север) для symbol-слоя с icon-rotate по bearing.
 * Рисуется на canvas в браузере; в SSR/тестах не вызывается.
 */
export function makeArrowIcon(size = 36, color = '#1e40af'): HTMLCanvasElement {
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
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = size * 0.06
  ctx.lineJoin = 'round'
  ctx.fill()
  ctx.stroke()
  return canvas
}
