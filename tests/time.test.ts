import { describe, expect, it } from 'vitest';
import { isEventPast, isUnlocked, kaliningradDate } from '../src/lib/time';
import { dateForDay, dayForDate, defaultTypeFor, END_DATE } from '../src/lib/calendar';

// Калининград = UTC+2 круглый год, значит полночь 24.10 по Калининграду = 23.10 22:00 UTC.
describe('isUnlocked: граница суток в Europe/Kaliningrad', () => {
  it('ячейка 1 закрыта за секунду до полуночи по Калининграду', () => {
    expect(isUnlocked(1, new Date('2026-10-23T21:59:59.999Z'))).toBe(false);
  });

  it('ячейка 1 открывается ровно в 00:00 по Калининграду', () => {
    expect(isUnlocked(1, new Date('2026-10-23T22:00:00.000Z'))).toBe(true);
  });

  it('день рождения (ячейка 9) — граница 31.10 22:00 UTC', () => {
    expect(dateForDay(9)).toBe('2026-11-01');
    expect(isUnlocked(9, new Date('2026-10-31T21:59:59Z'))).toBe(false);
    expect(isUnlocked(9, new Date('2026-10-31T22:00:00Z'))).toBe(true);
  });

  it('последняя ячейка 32 — 24 ноября', () => {
    expect(dateForDay(32)).toBe('2026-11-24');
    expect(END_DATE).toBe('2026-11-24');
    expect(isUnlocked(32, new Date('2026-11-23T21:59:59Z'))).toBe(false);
    expect(isUnlocked(32, new Date('2026-11-23T22:00:00Z'))).toBe(true);
  });

  it('открытая ячейка остаётся открытой навсегда', () => {
    expect(isUnlocked(1, new Date('2026-12-31T12:00:00Z'))).toBe(true);
    expect(isUnlocked(1, new Date('2027-06-01T12:00:00Z'))).toBe(true);
  });

  it('не зависит от пояса устройства: в Москве уже 00:30, а в Калининграде ещё 23:30', () => {
    // 2026-10-23T21:30Z: Москва (UTC+3) — 24.10 00:30, Калининград — 23.10 23:30
    expect(isUnlocked(1, new Date('2026-10-24T00:30:00+03:00'))).toBe(false);
  });

  it('во Владивостоке уже день 24.10, но в Калининграде ещё 23.10', () => {
    // 24.10 06:00 во Владивостоке (UTC+10) = 23.10 20:00 UTC = 23.10 22:00 в Калининграде
    expect(isUnlocked(1, new Date('2026-10-24T06:00:00+10:00'))).toBe(false);
  });

  it('в Лондоне ещё 23.10 23:00, а в Калининграде уже 24.10 01:00', () => {
    expect(isUnlocked(1, new Date('2026-10-23T23:00:00+00:00'))).toBe(true);
  });

  it('ячейка завтрашнего дня закрыта, вчерашнего — открыта', () => {
    const now = new Date('2026-11-05T10:00:00Z');
    expect(isUnlocked(dayForDate('2026-11-05'), now)).toBe(true);
    expect(isUnlocked(dayForDate('2026-11-04'), now)).toBe(true);
    expect(isUnlocked(dayForDate('2026-11-06'), now)).toBe(false);
  });
});

describe('kaliningradDate', () => {
  it('переводит момент в калининградскую дату', () => {
    expect(kaliningradDate(new Date('2026-10-23T21:59:59Z'))).toBe('2026-10-23');
    expect(kaliningradDate(new Date('2026-10-23T22:00:00Z'))).toBe('2026-10-24');
  });
});

describe('isEventPast', () => {
  it('событие в 18:00 прошло после 16:00 UTC', () => {
    expect(isEventPast('2026-10-24', '18:00', new Date('2026-10-24T15:59:00Z'))).toBe(false);
    expect(isEventPast('2026-10-24', '18:00', new Date('2026-10-24T16:00:00Z'))).toBe(true);
  });

  it('событие без времени прошло, когда закончился его день', () => {
    expect(isEventPast('2026-10-25', undefined, new Date('2026-10-25T21:59:00Z'))).toBe(false);
    expect(isEventPast('2026-10-25', undefined, new Date('2026-10-25T22:00:00Z'))).toBe(true);
  });
});

describe('календарь', () => {
  it('32 дня с 24.10 по 24.11, особые типы на месте', () => {
    expect(dateForDay(1)).toBe('2026-10-24');
    expect(dayForDate('2026-11-24')).toBe(32);
    expect(defaultTypeFor('2026-10-24')).toBe('intro');
    expect(defaultTypeFor('2026-11-01')).toBe('birthday');
    expect(defaultTypeFor('2026-11-24')).toBe('finale');
    expect(defaultTypeFor('2026-11-02')).toBe('history'); // понедельник
    expect(defaultTypeFor('2026-11-07')).toBe('trip'); // суббота
  });
});
