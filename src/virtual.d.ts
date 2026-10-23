/// <reference types="vite/client" />

// Модуль генерирует плагин src/build/adventData.ts; точные типы задаются в src/lib/cells.ts.
declare module 'virtual:advent-data' {
  export const sealedCells: unknown;
  export const homlins: unknown;
  export const homlinDays: unknown;
}
