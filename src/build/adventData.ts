import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { validateData } from '../data/schema';
import { sealCell } from '../lib/crypto';
import type { Cell } from '../types';

const VIRTUAL_ID = 'virtual:advent-data';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

export function loadData(root: string) {
  const read = (file: string) => {
    const full = path.join(root, 'data', file);
    try {
      return JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch (e) {
      throw new Error(`Не получилось прочитать data/${file}: ${(e as Error).message}`);
    }
  };
  const cells = validateData(read('cells.json'));
  const missing = cells.flatMap((cell) =>
    (cell.images ?? [])
      .filter((img) => !fs.existsSync(path.join(root, 'public', 'img', img.src)))
      .map((img) => `  ячейка ${cell.day}: нет картинки public/img/${img.src}`),
  );
  if (missing.length) throw new Error(`Ошибки в данных календаря:\n${missing.join('\n')}`);
  return cells;
}

/** Читает data/cells.json, проверяет схему и отдаёт приложению зашифрованные ячейки. */
export function adventData(): Plugin {
  let root = process.cwd();
  return {
    name: 'advent-data',
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return null;
      this.addWatchFile(path.join(root, 'data', 'cells.json'));
      const cells = loadData(root);
      const sealed = await Promise.all(
        [...cells].sort((a, b) => a.day - b.day).map((c) => sealCell(c as Cell)),
      );
      return `export const sealedCells = ${JSON.stringify(sealed)};`;
    },
    handleHotUpdate(ctx) {
      if (ctx.file.replace(/\\/g, '/').includes('/data/')) {
        const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) ctx.server.moduleGraph.invalidateModule(mod);
        ctx.server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}
