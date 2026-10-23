import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateData } from '../src/data/schema';
import { openCell, sealCell } from '../src/lib/crypto';
import { createProgressStore, parseProgress } from '../src/lib/progress';
import { createSafeStorage } from '../src/lib/storage';
import { renderMarkdown } from '../src/lib/markdown';
import type { Cell } from '../src/types';

const cells = JSON.parse(fs.readFileSync('data/cells.json', 'utf8'));
const homlins = JSON.parse(fs.readFileSync('data/homlins.json', 'utf8'));

describe('данные', () => {
  it('data/cells.json и data/homlins.json проходят проверку', () => {
    expect(() => validateData(cells, homlins)).not.toThrow();
  });

  it('опечатка в дате ломает проверку с понятной ошибкой', () => {
    const broken = [{ ...cells[0], date: '2026-10-25' }];
    expect(() => validateData(broken, homlins)).toThrow(/ячейка 1 должна быть на 2026-10-24/);
  });

  it('неизвестный тип и лишнее поле ломают проверку', () => {
    expect(() => validateData([{ ...cells[0], type: 'histroy' }], homlins)).toThrow();
    expect(() => validateData([{ ...cells[0], titel: 'x' }], homlins)).toThrow();
  });

  it('ссылка на несуществующего хомлина ломает проверку', () => {
    expect(() => validateData([{ ...cells[0], homlin: 'karl' }], [])).toThrow(/хомлина «karl» нет/);
  });
});

describe('шифрование ячеек', () => {
  it('ячейка шифруется и расшифровывается обратно', async () => {
    const cell = cells[0] as Cell;
    const sealed = await sealCell(cell);
    expect(sealed.data).not.toContain(cell.title);
    expect(JSON.stringify(sealed)).not.toContain('Калинин');
    expect(await openCell(sealed)).toEqual(cell);
  });
});

describe('прогресс', () => {
  it('без localStorage всё работает в памяти', () => {
    const storage = createSafeStorage(() => {
      throw new Error('SecurityError');
    });
    expect(storage.persistent).toBe(false);
    const store = createProgressStore(storage);
    store.markSeen('2026-10-24');
    store.setTaskDone('2026-10-24', true);
    expect(store.get().seen['2026-10-24']).toBeTruthy();
    store.setTaskDone('2026-10-24', false);
    expect(store.get().tasksDone['2026-10-24']).toBeUndefined();
  });

  it('испорченные данные в хранилище не ломают сайт', () => {
    expect(parseProgress('{не json')).toEqual(parseProgress(null));
    expect(parseProgress('{"version":2}').seen).toEqual({});
  });
});

describe('markdown', () => {
  it('экранирует HTML и понимает жирный, курсив и ссылки', () => {
    expect(renderMarkdown('<b>x</b>')).toBe('<p>&lt;b&gt;x&lt;/b&gt;</p>');
    expect(renderMarkdown('**a** *b*')).toBe('<p><strong>a</strong> <em>b</em></p>');
    expect(renderMarkdown('[сайт](https://x.ru)')).toContain('target="_blank"');
    expect(renderMarkdown('[плохо](javascript:alert(1))')).not.toContain('<a');
  });
});
