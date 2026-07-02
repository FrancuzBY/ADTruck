import type { Truck } from '../domain/types'
import { getSimSpeed } from './clock'
import { simNow } from './clock'
import { truckFeatures, type TruckFeatureCollection } from './features'

/**
 * rAF-тикер симуляции вне React: считает FeatureCollection и отдаёт в onFrame
 * (обычно source.setData). Частота 1 Гц на 1x, 5 Гц на 60x; пауза при
 * document.hidden. Позиции детерминированы (simNow), поэтому пропуск кадров
 * невидимой вкладки безопасен.
 */
export interface SimEngine {
  start: () => void
  stop: () => void
  /** Немедленно пересчитать и отдать кадр (для первого рендера/тестов). */
  tickNow: () => TruckFeatureCollection
}

export function createSimEngine(
  getTrucks: () => Truck[],
  onFrame: (fc: TruckFeatureCollection) => void,
): SimEngine {
  let rafId: number | null = null
  let lastFrameMs = 0

  const frameIntervalMs = () => (getSimSpeed() >= 60 ? 200 : 1000)

  const compute = () => truckFeatures(simNow(), getTrucks())

  const loop = (nowReal: number) => {
    if (document.hidden) {
      lastFrameMs = nowReal
    } else if (nowReal - lastFrameMs >= frameIntervalMs()) {
      lastFrameMs = nowReal
      onFrame(compute())
    }
    rafId = requestAnimationFrame(loop)
  }

  return {
    start() {
      if (rafId !== null) return
      onFrame(compute()) // первый кадр сразу
      lastFrameMs = performance.now()
      rafId = requestAnimationFrame(loop)
    },
    stop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    },
    tickNow() {
      const fc = compute()
      onFrame(fc)
      return fc
    },
  }
}
