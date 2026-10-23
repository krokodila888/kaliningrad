import { z } from 'zod';
import { TOTAL_DAYS, dateForDay } from '../lib/calendar';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'дата в формате ГГГГ-ММ-ДД');
const url = z.string().url('ссылка должна начинаться с https://');
const nonEmpty = z.string().trim().min(1, 'не может быть пустым');

export const homlinIdSchema = z.enum(['karl', 'marta', 'varvara', 'leo', 'vitek', 'ulya', 'antoshka']);

export const cellTypeSchema = z.enum([
  'intro', 'history', 'taste', 'route', 'museum', 'gift', 'trip', 'slow', 'birthday', 'finale',
]);

export const cellSchema = z
  .object({
    day: z.number().int().min(1).max(TOTAL_DAYS),
    date: isoDate,
    type: cellTypeSchema,
    title: nonEmpty,
    story: nonEmpty,
    practical: z
      .object({
        address: nonEmpty.optional(),
        hours: nonEmpty.optional(),
        price: nonEmpty.optional(),
        distanceFromHome: nonEmpty.optional(),
        mapUrl: url
          .refine((u) => /^https:\/\/yandex\.(ru|com)\/maps/.test(u), 'mapUrl должен вести на Яндекс Карты')
          .optional(),
      })
      .strict(),
    task: z.object({ text: nonEmpty, answer: nonEmpty.optional() }).strict().optional(),
    gift: z
      .object({ title: nonEmpty, description: nonEmpty, link: url.optional(), code: nonEmpty.optional() })
      .strict()
      .optional(),
    homlin: homlinIdSchema.optional(),
    image: z.object({ src: nonEmpty, alt: nonEmpty }).strict().optional(),
    events: z
      .array(
        z
          .object({
            time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'время в формате ЧЧ:ММ').optional(),
            title: nonEmpty,
            place: nonEmpty,
            price: nonEmpty.optional(),
            link: url.optional(),
          })
          .strict(),
      )
      .max(4, 'не больше 4 событий в день')
      .optional(),
  })
  .strict()
  .superRefine((cell, ctx) => {
    const expected = dateForDay(cell.day);
    if (cell.date !== expected) {
      ctx.addIssue({ code: 'custom', path: ['date'], message: `ячейка ${cell.day} должна быть на ${expected}` });
    }
  });

export const homlinSchema = z
  .object({ id: homlinIdSchema, name: nonEmpty, riddle: nonEmpty, place: nonEmpty, revealText: nonEmpty })
  .strict();

export const cellsFileSchema = z.array(cellSchema);
export const homlinsFileSchema = z.array(homlinSchema);

export interface ValidatedData {
  cells: z.infer<typeof cellsFileSchema>;
  homlins: z.infer<typeof homlinsFileSchema>;
}

/** Проверяет оба файла данных и связи между ними. Бросает понятную ошибку — сборка падает. */
export function validateData(rawCells: unknown, rawHomlins: unknown): ValidatedData {
  const problems: string[] = [];
  const cellsRes = cellsFileSchema.safeParse(rawCells);
  const homlinsRes = homlinsFileSchema.safeParse(rawHomlins);
  const fmt = (file: string, err: z.ZodError) =>
    err.issues.map((i) => `  ${file} → ${i.path.join('.') || '(корень)'}: ${i.message}`);
  if (!cellsRes.success) problems.push(...fmt('data/cells.json', cellsRes.error));
  if (!homlinsRes.success) problems.push(...fmt('data/homlins.json', homlinsRes.error));

  if (cellsRes.success && homlinsRes.success) {
    const seenDays = new Set<number>();
    const homlinIds = new Set(homlinsRes.data.map((h) => h.id));
    const usedHomlins = new Map<string, number>();
    for (const cell of cellsRes.data) {
      if (seenDays.has(cell.day)) problems.push(`  data/cells.json: ячейка ${cell.day} описана дважды`);
      seenDays.add(cell.day);
      if (cell.homlin) {
        if (!homlinIds.has(cell.homlin)) {
          problems.push(`  data/cells.json → ячейка ${cell.day}: хомлина «${cell.homlin}» нет в homlins.json`);
        }
        const prev = usedHomlins.get(cell.homlin);
        if (prev) problems.push(`  data/cells.json: хомлин «${cell.homlin}» уже есть в ячейке ${prev}`);
        usedHomlins.set(cell.homlin, cell.day);
      }
    }
    const ids = homlinsRes.data.map((h) => h.id);
    if (new Set(ids).size !== ids.length) problems.push('  data/homlins.json: повторяется id хомлина');
  }

  if (problems.length) {
    throw new Error(`Ошибки в данных календаря:\n${problems.join('\n')}`);
  }
  return { cells: cellsRes.data!, homlins: homlinsRes.data! };
}
