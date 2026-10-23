import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/700-italic.css';
import '@fontsource/golos-text/400.css';
import '@fontsource/golos-text/600.css';
import '@fontsource/golos-text/700.css';
import './styles/global.css';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';

// Офлайн-режим. Когда выходит новая версия (например, дописана ячейка), страница тихо обновляется сама.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    // Вкладка на телефоне может жить днями — раз в час проверяем, не вышла ли новая версия.
    if (registration) setInterval(() => registration.update().catch(() => undefined), 60 * 60 * 1000);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
