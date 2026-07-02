import { useEffect, useState } from 'react'

/** Форсирует ре-рендер каждые intervalMs (для «живых» списков: статус фуры, km dzisiaj). */
export function useTick(intervalMs = 1000): number {
  const [, setN] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setN((n) => n + 1), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return Date.now()
}
