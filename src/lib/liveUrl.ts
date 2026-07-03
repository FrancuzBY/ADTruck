/** Канонический prod-URL, чтобы QR со стенда (localhost) вёл на рабочий сайт. */
export function liveUrl(path: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const isLocal = /localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\./.test(origin)
  const base = !origin || isLocal ? 'https://ad-truck.vercel.app' : origin
  return base + path
}
