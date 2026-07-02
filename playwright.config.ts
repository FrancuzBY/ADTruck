import { defineConfig, devices } from '@playwright/test'

/**
 * E2E против production-сборки в режиме VITE_E2E=1 (пустой map-style без тайлов —
 * WebGL в headless не рендерит растр; ассерты идут через window.__adtruckDebug).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 390, height: 844 },
    launchOptions: { args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] },
  },
  projects: [{ name: 'mobile-chromium', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: 'npm run build:e2e && npm run preview -- --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
