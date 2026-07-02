import type { Route } from '../domain/types'
import routesJson from './routes.json'

/** 36 реальных дорожных коридоров «PL ↔ EU» (генерируется scripts/fetch-routes.mjs). */
export const ROUTES: Route[] = routesJson as Route[]

export function routeById(id: string): Route | undefined {
  return ROUTES.find((r) => r.id === id)
}
