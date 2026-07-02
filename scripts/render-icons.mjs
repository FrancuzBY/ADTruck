#!/usr/bin/env node
/** Растеризация SVG-иконок в PNG для PWA-манифеста (через Playwright chromium). */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public')
const jobs = [
  { svg: 'icon-any.svg', out: 'pwa-192.png', size: 192 },
  { svg: 'icon-any.svg', out: 'pwa-512.png', size: 512 },
  { svg: 'icon-any.svg', out: 'apple-touch-icon.png', size: 180 },
  { svg: 'icon-maskable.svg', out: 'pwa-maskable-512.png', size: 512 },
]

const browser = await chromium.launch()
for (const job of jobs) {
  const svg = readFileSync(path.join(dir, job.svg), 'utf8')
  const page = await browser.newPage({ viewport: { width: job.size, height: job.size }, deviceScaleFactor: 1 })
  await page.setContent(
    `<!doctype html><html><body style="margin:0"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${job.size}" height="${job.size}"></body></html>`,
  )
  await page.waitForTimeout(120)
  const buf = await page.locator('img').screenshot({ omitBackground: true })
  writeFileSync(path.join(dir, job.out), buf)
  await page.close()
  console.log(`${job.out} (${job.size}×${job.size}) ${(buf.length / 1024).toFixed(1)} KB`)
}
await browser.close()
