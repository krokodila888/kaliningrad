import type { CellType, IsoDate } from '../types';

export const START_DATE: IsoDate = '2026-10-24';
export const TOTAL_DAYS = 32;
export const BIRTHDAY: IsoDate = '2026-11-01';
export const FRIEND_NAME = 'Зёбра';

const DAY_MS = 24 * 60 * 60 * 1000;

function isoToUtcMs(date: IsoDate): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function dateForDay(day: number): IsoDate {
  return new Date(isoToUtcMs(START_DATE) + (day - 1) * DAY_MS).toISOString().slice(0, 10);
}

export function dayForDate(date: IsoDate): number {
  return Math.round((isoToUtcMs(date) - isoToUtcMs(START_DATE)) / DAY_MS) + 1;
}

export const END_DATE: IsoDate = dateForDay(TOTAL_DAYS);

export const ALL_DAYS: number[] = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);

/** 0 = воскресенье */
export function weekday(date: IsoDate): number {
  return new Date(isoToUtcMs(date)).getUTCDay();
}

const WEEK_RHYTHM: CellType[] = ['slow', 'history', 'taste', 'route', 'museum', 'gift', 'trip'];

/** Тип ячейки по умолчанию, пока для даты нет контента: ритм недели + особые дни. */
export function defaultTypeFor(date: IsoDate): CellType {
  if (date === START_DATE) return 'intro';
  if (date === BIRTHDAY) return 'birthday';
  if (date === END_DATE) return 'finale';
  return WEEK_RHYTHM[weekday(date)];
}

const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];
const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const WEEKDAYS_LONG = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

export function formatDate(date: IsoDate): { dayNum: number; month: string; weekdayShort: string; weekdayLong: string } {
  const [, m, d] = date.split('-').map(Number);
  const wd = weekday(date);
  return { dayNum: d, month: MONTHS_GEN[m - 1], weekdayShort: WEEKDAYS_SHORT[wd], weekdayLong: WEEKDAYS_LONG[wd] };
}

export function formatDateLong(date: IsoDate): string {
  const f = formatDate(date);
  return `${f.dayNum} ${f.month}, ${f.weekdayLong}`;
}
