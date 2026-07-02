/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'AdTruck — reklama na naczepach',
        short_name: 'AdTruck',
        description: 'Reklama na naczepach TIR z zasięgiem w całej Europie.',
        lang: 'pl',
        start_url: '/',
        display: 'standalone',
        theme_color: '#1e40af',
        background_color: '#f1f5f9',
        // иконки добавляются на этапе M7
        icons: [],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
