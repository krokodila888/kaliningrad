import { z } from 'zod';
import { TOTAL_DAYS, dateForDay } from '../lib/calendar';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'дата в формате ГГГГ-ММ-ДД');
const url = z.string().url('ссылка должна начинаться с https://');
const nonEmpty = z.string().trim().min(1, 'не может быть пустым');

const imageSchema = z
  .object({
    src: z.string().regex(/^[\w.-]+\.(webp|jpe?g|png|avif)$/i, 'имя файла из public/img, например kant.webp'),
    alt: nonEmpty,
    caption: nonEmpty.optional(),
    credit: z.object({ author: nonEmpty.optional(), license: nonEmpty, url }).strict().optional(),
  })
  .strict();

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
      .object({
        title: nonEmpty,
        description: nonEmpty,
        link: url.optional(),
        code: nonEmpty.optional(),
        image: imageSchema.optional(),
      })
      .strict()
      .optional(),
    images: z.array(imageSchema).max(4, 'не больше 4 картинок в ячейке').optional(),
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

export const cellsFileSchema = z.array(cellSchema);

export type ValidatedCells = z.infer<typeof cellsFileSchema>;

/** Проверяет data/cells.json. Бросает понятную ошибку — сборка падает. */
export function validateData(rawCells: unknown): ValidatedCells {
  const problems: string[] = [];
  const cellsRes = cellsFileSchema.safeParse(rawCells);
  const fmt = (file: string, err: z.ZodError) =>
    err.issues.map((i) => `  ${file} → ${i.path.join('.') || '(корень)'}: ${i.message}`);
  if (!cellsRes.success) problems.push(...fmt('data/cells.json', cellsRes.error));

  if (cellsRes.success) {
    const seenDays = new Set<number>();
    for (const cell of cellsRes.data) {
      if (seenDays.has(cell.day)) problems.push(`  data/cells.json: ячейка ${cell.day} описана дважды`);
      seenDays.add(cell.day);
    }
  }

  if (problems.length) {
    throw new Error(`Ошибки в данных календаря:\n${problems.join('\n')}`);
  }
  return cellsRes.data!;
}
