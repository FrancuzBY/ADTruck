/**
 * Константы оценщика. Числа AI-мокапа внутренне противоречивы, поэтому здесь
 * зафиксирован единственный консистентный набор — калибруется перед демо.
 *
 * Опорная фикстура (бьётся с экраном 3 мокапа и покрыта тестами):
 * 50 naczep × 3 miesiące (01.05–31.07.2026) → 450 000 zł.
 */

/** Средний месячный пробег полуприцепа на международных коридорах (~675 км/день × ~15 рабочих дней в одну сторону цикла). */
export const KM_PER_TRUCK_MONTH = 10_000

/** Цена аренды борта одной naczepy за месяц. 50 × 3 000 × 3 mies. = 450 000 zł. */
export const PRICE_PER_TRUCK_MONTH_PLN = 3_000

/** OTS (opportunity-to-see): показов на 1 км по трассе. */
export const OTS_PER_KM_HIGHWAY = 3

/** OTS: показов на 1 км в городской застройке. */
export const OTS_PER_KM_URBAN = 9

/** Дефолтная доля городских км по флоту, если маршрут не задан: даёт 4,5 показа/км. */
export const DEFAULT_URBAN_SHARE = 0.25

/** Прогноз показов даём диапазоном ±30% от середины. */
export const ESTIMATE_SPREAD = 0.3

/** Пределы слайдеров визарда (экран 2 мокапа). */
export const WIZARD_TRUCKS_MIN = 10
export const WIZARD_TRUCKS_MAX = 100
export const WIZARD_BUDGET_MIN_PLN = 30_000
export const WIZARD_BUDGET_MAX_PLN = 400_000
