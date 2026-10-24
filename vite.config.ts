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
        // В предкэше только иконки. Страница и файлы сборки кэшируются по мере загрузки (ниже):
        // так сохранённая страница и её скрипты всегда из одной версии, а после обновления
        // сайта новая версия видна с первого же захода.
        globPatterns: ['*.{svg,png}'],
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'advent-pages',
              // На косе связь слабая: если сеть не ответила за 3 секунды — показываем сохранённую страницу.
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 10 },
            },
          },
          {
            // Файлы сборки с хэшем в имени никогда не меняются. Старые не удаляем сразу,
            // чтобы сохранённая страница прошлой версии тоже открывалась без сети.
            urlPattern: new RegExp(`${BASE}assets/`.replace(/\//g, '\\/')),
            handler: 'CacheFirst',
            options: { cacheName: 'advent-assets', expiration: { maxEntries: 200 } },
          },
          {
            // Только RegExp: функции переносятся в sw.js текстом и не видят переменных этого файла.
            // Workbox сверяет его с полным адресом (https://…), поэтому без «^» в начале.
            urlPattern: new RegExp(`${BASE}img/`.replace(/\//g, '\\/')),
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
