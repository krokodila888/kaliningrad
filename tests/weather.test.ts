import { describe, expect, it } from 'vitest';
import { describeWeather, formatTemp, parseWeather, weatherTips, type WeatherDay } from '../src/lib/weather';

const day = (over: Partial<WeatherDay>): WeatherDay => ({
  date: '2026-10-24',
  code: 3,
  tMax: 12,
  tMin: 6,
  precipProb: 10,
  precipSum: 0,
  windMax: 4,
  sunset: '16:58',
  ...over,
});

describe('погода', () => {
  it('разбирает ответ Open-Meteo', () => {
    const w = parseWeather(
      {
        current: { temperature_2m: 8.7, apparent_temperature: 6.7, weather_code: 3, wind_speed_10m: 2.6 },
        daily: {
          time: ['2026-10-24'],
          weather_code: [51],
          temperature_2m_max: [12.6],
          temperature_2m_min: [7.1],
          precipitation_probability_max: [null],
          precipitation_sum: [0.4],
          wind_speed_10m_max: [6.2],
          sunset: ['2026-10-24T16:58'],
        },
      },
      1,
    );
    expect(w.now.temp).toBe(8.7);
    expect(w.days[0]).toMatchObject({ date: '2026-10-24', code: 51, precipProb: null, sunset: '16:58' });
  });

  it('переводит коды погоды', () => {
    expect(describeWeather(0).text).toBe('ясно');
    expect(describeWeather(3).text).toBe('пасмурно');
    expect(describeWeather(53).kind).toBe('drizzle');
    expect(describeWeather(63).text).toBe('дождь');
    expect(describeWeather(95).kind).toBe('storm');
  });

  it('форматирует температуру', () => {
    expect(formatTemp(8.7)).toBe('+9°');
    expect(formatTemp(-2.4)).toBe('−2°');
    expect(formatTemp(0.2)).toBe('0°');
  });

  it('советует зонт, шарф и шапку', () => {
    expect(weatherTips(day({ precipProb: 70 }))).toContain('Возьми зонт — обещают дождь.');
    expect(weatherTips(day({ windMax: 11 })).join(' ')).toMatch(/Сильный ветер/);
    expect(weatherTips(day({ tMax: 2 })).join(' ')).toMatch(/шапка/);
    expect(weatherTips(day({}))).toEqual(['Хорошая погода для прогулки.']);
    expect(weatherTips(day({ code: 51, precipProb: 2 }))).toEqual(['Может моросить — пригодится капюшон.']);
  });
});
