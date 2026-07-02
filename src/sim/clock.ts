/**
 * Симуляционные часы: simNow = anchorSim + (real − anchorReal) × speed.
 *
 * На 1x anchors совпадают с реальным временем ⇒ simNow ≡ wall-clock и позиции
 * детерминированы между сессиями. Переключение на 60x ре-анкорит от текущего
 * момента — ускоренная «жизнь» действует до перезагрузки страницы (осознанная
 * фича демо; после reload всё возвращается к wall-clock).
 */

let anchorRealMs = Date.now()
let anchorSimMs = anchorRealMs
let speed = 1

export function simNow(): number {
  return anchorSimMs + (Date.now() - anchorRealMs) * speed
}

export function getSimSpeed(): number {
  return speed
}

export function setSimSpeed(next: number): void {
  anchorSimMs = simNow()
  anchorRealMs = Date.now()
  speed = next
}

/** Для тестов: вернуть часы к wall-clock 1x. */
export function resetSimClock(): void {
  anchorRealMs = Date.now()
  anchorSimMs = anchorRealMs
  speed = 1
}
