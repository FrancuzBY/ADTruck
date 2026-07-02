import { expect, test } from '@playwright/test'

test('happy path: kreator przelicza koszt i tworzy kampanię, która przeżywa reload', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Twoja reklama jedzie/ })).toBeVisible()

  await page.getByRole('link', { name: 'Zamów kampanię' }).click()
  await expect(page).toHaveURL(/\/zamow$/)

  // 100 naczep → koszt 100 × 3000 × 3 mies. = 900 000 zł (live-пересчёт)
  await page.locator('input[type=range]').first().fill('100')
  await page.getByRole('button', { name: 'Dalej' }).click()
  await expect(page.getByText(/900\s*000\s*zł/)).toBeVisible()

  await page.getByRole('button', { name: 'Zamawiam' }).click()
  await expect(page.getByRole('heading', { name: 'Kampania utworzona!' })).toBeVisible()

  await page.goto('/kampanie')
  await expect(page.getByText('100 naczep')).toBeVisible()

  await page.reload()
  await expect(page.getByText('100 naczep')).toBeVisible() // persist через localStorage
})

test('mapa udostępnia żywą flotę przez debug-hook', async ({ page }) => {
  await page.goto('/mapa')
  await page.waitForFunction(() => (window.__adtruckDebug?.count ?? 0) >= 120, null, { timeout: 15_000 })
  const dbg = await page.evaluate(() => window.__adtruckDebug!)
  expect(dbg.count).toBe(120)
  for (const f of dbg.features) {
    const [lng, lat] = f.geometry.coordinates
    expect(lng).toBeGreaterThan(-10)
    expect(lng).toBeLessThan(30)
    expect(lat).toBeGreaterThan(35)
    expect(lat).toBeLessThan(60)
  }
})

test('przełącznik ról zmienia dolną nawigację', async ({ page }) => {
  await page.goto('/profil')
  await page.getByRole('button', { name: 'Przewoźnik' }).click()
  await expect(page.getByRole('link', { name: 'Flota' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Kampanie' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Reklamodawca' }).click()
  await expect(page.getByRole('link', { name: 'Kampanie' })).toBeVisible()
})

test('dodana naczepa pojawia się we flocie', async ({ page }) => {
  await page.goto('/flota')
  const before = await page.getByText(/km dziś/).count()

  await page.getByRole('link', { name: /Dodaj naczepę/ }).click()
  await expect(page).toHaveURL(/\/flota\/dodaj$/)
  await page.locator('input[type=text]').fill('KR 99999')
  await page.getByRole('button', { name: /Dodaj naczepę/ }).click()

  await expect(page).toHaveURL(/\/flota$/)
  await expect(page.getByText('KR 99999')).toBeVisible()
  expect(await page.getByText(/km dziś/).count()).toBe(before + 1)
})

test('manifest PWA jest serwowany', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest')
  expect(res.status()).toBe(200)
  const m = await res.json()
  expect(m.name).toContain('AdTruck')
  expect(m.icons.length).toBeGreaterThanOrEqual(3)
})
