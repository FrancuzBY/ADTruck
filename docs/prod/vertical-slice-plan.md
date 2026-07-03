# AdTruck Prod — вертикальный срез: технический план (для сборки)

_Внутренний dev-план (не клиентский; клиентские отчёты — в `docs/research/adtruck-*`). Стек по умолчанию — Supabase; AWS-альтернатива помечена. Статус: ждёт выбора бэкенда, дальше исполняется по этапам._

## Принципы
- **Не ломаем живой POC** на ad-truck.vercel.app — он остаётся как демо для клиента (отдельная ветка/деплой), пока строим прод.
- **Переиспользуем готовый код**: `domain/` (types, estimator, campaign, dates), `sim/`, `i18n/`, дизайн-токены, UI-компоненты — выносим в общий пакет `core`.
- **Backend-seam**: весь доступ к данным идёт через слой репозиториев/сервисов; текущая реализация — local/sim, прод-реализация — Supabase. Замена без переписывания UI.

## Архитектура
- **Клиенты:** Expo (React Native) → iOS + Android + web из одной базы. Старт — на текущем вебе (добавляем seam), затем Expo-обёртка.
- **Бэкенд (по умолч. Supabase):** Postgres + Auth + Storage + Realtime + RLS.
  - _AWS-альтернатива:_ Cognito (auth) + AppSync/API GW + RDS(Postgres) + S3. Дороже/дольше, гибче на масштаб.
- **Структура (monorepo):** `packages/core` (домен/логика/типы), `apps/web`, `apps/mobile` (Expo), `apps/driver` (или роль в mobile).

## Модель данных (Supabase, RLS по `org_id`)
- `orgs` (арендаторы) — id, name, plan.
- `profiles` — user_id (=auth.uid), org_id, role (`advertiser|carrier|admin`), name.
- `carriers` — org_id, name (перевозчики-владельцы флота).
- `trucks` — id, carrier_id, plate, route_id, tractor/trailer/country (профиль), available_from (окна доступности).
- `campaigns` — org_id, advertiser_id, dates, trucks_count, budget, status, target (country | truck_ids).
- `campaign_trucks` — campaign_id, truck_id, creative_id.
- `creatives` — org_id, name, asset_url.
- `driver_positions` — truck_id, lng, lat, speed, ts (реальный GPS).
- `invoices` — org_id, campaign_id, amount, status (этап Prod).
- **RLS:** строки видны, если `org_id = auth.jwt().org_id` (или admin). Политики select/insert/update per-таблица.

## Auth-флоу
- Supabase Auth: email+пароль и OAuth; сброс; приглашения (invite → привязка к org+role).
- Онбординг роли: advertiser / carrier; admin — вручную.

## Реальный GPS (замена симулятора)
- Приложение водителя (Expo, роль carrier/driver) шлёт геолокацию → `driver_positions` (батчинг, фоновый режим, consent).
- Live-карта читает позиции из БД (Supabase Realtime) вместо `simNow()`-симулятора.
- MVP-гибрид: демо-флот из симулятора + реальные позиции добавленных фур (плавный переход, демо не «пустеет»).

## Экраны MVP
login/register · онбординг роли · лендинг · визард заказа (по стране / по конкретной фуре) · калькулятор · кампании + отчёт (live) · карта (live из БД) · карточка машины · мини-админка (клиенты/юзеры/кампании/фуры/модерация) · приложение водителя.

## Этапы
1. **M1 — каркас:** monorepo, вынос `core`, Supabase-клиент, env/секреты.
2. **M2 — auth + БД:** схема, RLS, регистрация/логин/роли/приглашения, multi-tenant.
3. **M3 — перенос UI на репозитории:** лендинг/визард/карта/кампании через сервис-слой (данные из БД).
4. **M4 — заказ по стране/фуре + калькулятор** на серверных данных.
5. **M5 — приложение водителя + live-позиции** из БД (реальный GPS).
6. **M6 — мини-админка + деплой** (EAS для mobile, Vercel для web) + RODO-минимум.

## Нужно от заказчика/для старта
- Проект **Supabase** (free tier) → URL + anon/service ключи. _(или AWS-аккаунт при выборе AWS.)_
- Apple Developer + Google Play аккаунты (для сборок/релиза).
- Юрист для RODO (политика/согласия) — до сбора реальных данных.

## Первый шаг после выбора бэкенда
M1+M2: подниму monorepo + `core`, заведу схему и RLS, сделаю auth (логин/роли/tenant) — на этом срез уже «дышит». Текущий POC не трогаю.
