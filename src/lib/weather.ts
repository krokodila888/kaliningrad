import { useEffect, useState } from 'react';
import type { IsoDate } from '../types';
import { createSafeStorage } from './storage';

/**
 * Погода в центре Калининграда от Open-Meteo (бесплатно, без ключа).
 * Координаты фиксированные — никаких данных о посетителе не отправляется.
 * Последний ответ хранится локально: без сети показываем его, пока он не старше суток.
 */
const API =
  'https://api.open-meteo.com/v1/forecast?latitude=54.72&longitude=20.5' +
  '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m' +
  '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,sunset' +
  '&timezone=Europe%2FKaliningrad&wind_speed_unit=ms&forecast_days=7';

const KEY = 'kaliningrad-advent:weather:v1';
const FRESH_MS = 30 * 60 * 1000;
const STALE_MS = 24 * 60 * 60 * 1000;

export interface WeatherNow {
  temp: number;
  feels: number;
  code: number;
  wind: number;
}

export interface WeatherDay {
  date: IsoDate;
  code: number;
  tMax: number;
  tMin: number;
  /** Вероятность осадков, % (может отсутствовать) */
  precipProb: number | null;
  precipSum: number;
  windMax: number;
  /** 'HH:MM' */
  sunset: string;
}

export interface Weather {
  fetchedAt: number;
  now: WeatherNow;
  days: WeatherDay[];
}

interface ApiResponse {
  current: { temperature_2m: number; apparent_temperature: number; weather_code: number; wind_speed_10m: number };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    sunset: string[];
  };
}

export function parseWeather(json: ApiResponse, fetchedAt: number): Weather {
  const d = json.daily;
  return {
    fetchedAt,
    now: {
      temp: json.current.temperature_2m,
      feels: json.current.apparent_temperature,
      code: json.current.weather_code,
      wind: json.current.wind_speed_10m,
    },
    days: d.time.map((date, i) => ({
      date,
      code: d.weather_code[i],
      tMax: d.temperature_2m_max[i],
      tMin: d.temperature_2m_min[i],
      precipProb: d.precipitation_probability_max[i] ?? null,
      precipSum: d.precipitation_sum[i] ?? 0,
      windMax: d.wind_speed_10m_max[i],
      sunset: (d.sunset[i] ?? '').slice(11, 16),
    })),
  };
}

const storage = createSafeStorage();

function readCache(): Weather | null {
  try {
    const raw = storage.get(KEY);
    if (!raw) return null;
    const w = JSON.parse(raw) as Weather;
    return typeof w?.fetchedAt === 'number' && Array.isArray(w.days) ? w : null;
  } catch {
    return null;
  }
}

let inflight: Promise<Weather | null> | null = null;

async function fetchWeather(): Promise<Weather | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(API, { signal: ctrl.signal });
    if (!res.ok) return null;
    const w = parseWeather((await res.json()) as ApiResponse, Date.now());
    storage.set(KEY, JSON.stringify(w));
    return w;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Погода или null, если её нет (нет сети и нет свежего кэша) — тогда блоки просто не показываются. */
export function useWeather(): Weather | null {
  const [weather, setWeather] = useState<Weather | null>(() => {
    const c = readCache();
    return c && Date.now() - c.fetchedAt < STALE_MS ? c : null;
  });

  useEffect(() => {
    let alive = true;
    const refresh = () => {
      const c = readCache();
      if (c && Date.now() - c.fetchedAt < FRESH_MS) return;
      inflight ??= fetchWeather().finally(() => {
        inflight = null;
      });
      inflight.then((w) => alive && w && setWeather(w));
    };
    refresh();
    const id = window.setInterval(refresh, FRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return weather;
}

export type WeatherKind = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm';

/** Коды погоды WMO → вид и подпись по-русски. */
export function describeWeather(code: number): { kind: WeatherKind; text: string } {
  if (code === 0) return { kind: 'clear', text: 'ясно' };
  if (code === 1) return { kind: 'partly', text: 'почти ясно' };
  if (code === 2) return { kind: 'partly', text: 'переменная облачность' };
  if (code === 3) return { kind: 'cloudy', text: 'пасмурно' };
  if (code === 45 || code === 48) return { kind: 'fog', text: 'туман' };
  if (code >= 51 && code <= 57) return { kind: 'drizzle', text: 'морось' };
  if (code >= 61 && code <= 67) return { kind: 'rain', text: code >= 65 ? 'сильный дождь' : 'дождь' };
  if (code >= 71 && code <= 77) return { kind: 'snow', text: 'снег' };
  if (code >= 80 && code <= 82) return { kind: 'rain', text: 'ливень' };
  if (code === 85 || code === 86) return { kind: 'snow', text: 'снегопад' };
  if (code >= 95) return { kind: 'storm', text: 'гроза' };
  return { kind: 'cloudy', text: 'облачно' };
}

export function formatTemp(t: number): string {
  const r = Math.round(t);
  return `${r > 0 ? '+' : r < 0 ? '−' : ''}${Math.abs(r)}°`;
}

/** Короткие советы на день: зонт, ветер, холод. */
export function weatherTips(day: WeatherDay): string[] {
  const tips: string[] = [];
  const kind = describeWeather(day.code).kind;
  if ((day.precipProb ?? 0) >= 50 || day.precipSum >= 1 || kind === 'rain' || kind === 'storm') {
    tips.push('Возьми зонт — обещают дождь.');
  } else if (kind === 'drizzle') {
    tips.push('Может моросить — пригодится капюшон.');
  } else if (kind === 'fog') {
    tips.push('Туман: виды с мостов будут таинственными.');
  }
  if (day.windMax >= 10) tips.push('Сильный ветер: у воды и на набережных будет зябко.');
  else if (day.windMax >= 7) tips.push('Ветрено — пригодится шарф.');
  if (day.tMax <= 3) tips.push('Холодно: шапка и перчатки не помешают.');
  if (kind === 'snow') tips.push('Возможен снег — обувь лучше непромокаемая.');
  if (tips.length === 0) tips.push('Хорошая погода для прогулки.');
  return tips;
}
