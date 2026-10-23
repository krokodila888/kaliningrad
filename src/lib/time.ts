import type { IsoDate } from '../types';
import { dateForDay } from './calendar';

/** Калининград живёт по UTC+2 круглый год (без перехода на летнее время с 2014 года). */
const KALININGRAD_OFFSET_MS = 2 * 60 * 60 * 1000;

let formatter: Intl.DateTimeFormat | null | undefined;

function getFormatter(): Intl.DateTimeFormat | null {
  if (formatter === undefined) {
    try {
      formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Kaliningrad',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      formatter = null;
    }
  }
  return formatter;
}

/** Календарная дата в Калининграде для момента now — независимо от пояса устройства. */
export function kaliningradDate(now: Date): IsoDate {
  const f = getFormatter();
  if (f) {
    const parts = f.formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    const iso = `${get('year')}-${get('month')}-${get('day')}`;
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  }
  return new Date(now.getTime() + KALININGRAD_OFFSET_MS).toISOString().slice(0, 10);
}

/** Ячейка открывается в 00:00 по Калининграду в свой день и дальше остаётся открытой навсегда. */
export function isUnlocked(day: number, now: Date): boolean {
  return dateForDay(day) <= kaliningradDate(now);
}

/** Момент начала события (по калининградскому времени) в виде Date. */
export function eventStart(date: IsoDate, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - KALININGRAD_OFFSET_MS);
}

/** Событие прошло: началось (если указано время) или его день уже закончился. */
export function isEventPast(date: IsoDate, time: string | undefined, now: Date): boolean {
  if (time) return now.getTime() >= eventStart(date, time).getTime();
  return date < kaliningradDate(now);
}
