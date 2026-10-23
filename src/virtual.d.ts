/// <reference types="vite/client" />

// Модуль генерирует плагин src/build/adventData.ts; точный тип задаётся в src/lib/cells.ts.
declare module 'virtual:advent-data' {
  export const sealedCells: unknown;
}
