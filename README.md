# AdTruck — POC

Веб-демо двусторонней платформы «реклама на бортах фур TIR + live-карта Европы» для показа клиенту (рынок — Польша). UI на польском. Движение траков — детерминированный симулятор (без бэкенда и телематики).

**Стратегия:** POC (этот репозиторий) → MVP на Expo/React Native (iOS + Android) → продукт. Анализ рынка, ставок и цены продажи — в [`docs/research/market-analysis.md`](docs/research/market-analysis.md).

## Стек

Vite + React 19 + TypeScript (strict) · Tailwind CSS v4 (`@theme`-токены) · react-router · zustand (persist = «БД» демо) · MapLibre GL JS + OpenFreeMap (векторные тайлы без ключа) · framer-motion · vite-plugin-pwa · vitest + Playwright.

## Команды

```bash
npm install
npm run dev            # дев-сервер
npm run build          # прод-сборка (tsc + vite + PWA)
npm run preview        # предпросмотр прод-сборки
npm test               # юнит-тесты (vitest): оценщик, одометр, симулятор, формат
npm run test:e2e       # e2e (Playwright, VITE_E2E=1 — пустой map-style)
npm run lint           # oxlint

# Один раз, чтобы перегенерировать маршруты из OSRM (коммитятся как routes.json):
node scripts/fetch-routes.mjs
# Перегенерировать PWA-иконки из SVG:
node scripts/render-icons.mjs
```

## Экраны

`/` лендинг · `/zamow` → `/zamow/podsumowanie` → `/zamow/potwierdzenie` (визард) · `/mapa` live-карта (120+ фур, контрол `1×/60×`) · `/kampanie`, `/kampanie/:id` (отчёт) · `/flota`, `/flota/dodaj` · `/profil` (роль-свитчер, Reset demo).

`?speed=60` в URL ускоряет симуляцию для демо.

## Деплой

Статика в `dist/`. Готовы конфиги для **Netlify** (`netlify.toml` + `public/_redirects`) и **Vercel** (`vercel.json`) с SPA-fallback и no-cache для `sw.js`. Нужен HTTPS (для PWA/Service Worker).

## Демо-сценарий (2 мин)

1. Лендинг → «Zamów kampanię».
2. Визард: подвигать слайдеры (koszt пересчитывается вживую; дефолт 50 naczep × 3 mies. = **450 000 zł**) → «Dalej» → «Zamawiam».
3. Экран успеха → «Zobacz mapę»: живая карта Европы, `1×`→`60×` — фуры едут.
4. «Kampanie» → открыть кампанию: przebieg, wyświetlenia, бары покрытия по странам, карта фур.
5. `/profil` → роль «Przewoźnik» → «Flota» → «Dodaj naczepę» → новая фура сразу в списке и на карте.
6. На телефоне: «Добавить на главный экран» — ставится как приложение (PWA).
