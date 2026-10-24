import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { adventData } from './src/build/adventData';

// Сайт живёт на https://krokodila888.github.io/kaliningrad/ — отсюда base.
const BASE = '/kaliningrad/';

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    adventData(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Калининградский адвент',
        short_name: 'Адвент',
        description: 'Каждый день — новая ячейка про Калининград',
        lang: 'ru',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        background_color: '#0d1b2a',
        theme_color: '#16324f',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: `${BASE}index.html`,
        runtimeCaching: [
          {
            // Только RegExp: функции переносятся в sw.js текстом и не видят переменных этого файла.
            urlPattern: new RegExp(`^${BASE}img/`.replace(/\//g, '\\/')),
            handler: 'CacheFirst',
            options: {
              cacheName: 'advent-images',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
        ],
      },
    }),
  ],
});
