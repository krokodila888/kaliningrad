import type { IsoDate } from '../types';
import { describeWeather, formatTemp, weatherTips, type Weather, type WeatherKind } from '../lib/weather';
import { Icon, type IconName } from './icons';
import s from './Cell.module.css';
import a from '../App.module.css';

const KIND_ICON: Record<WeatherKind, IconName> = {
  clear: 'sun',
  partly: 'partly',
  cloudy: 'cloud',
  fog: 'fog',
  drizzle: 'rain',
  rain: 'rain',
  snow: 'snow',
  storm: 'storm',
};

/** Погода на день ячейки — показывается, только если для этой даты есть прогноз. */
export function WeatherCard({ date, weather }: { date: IsoDate; weather: Weather | null }) {
  const day = weather?.days.find((d) => d.date === date);
  if (!day) return null;
  const w = describeWeather(day.code);
  // Первый день прогноза — сегодня: показываем «сейчас», как в шапке, а за день — диапазон.
  const isToday = weather!.days[0]?.date === date;
  const nowW = describeWeather(weather!.now.code);
  const range = `от ${formatTemp(day.tMin)} до ${formatTemp(day.tMax)}`;
  const details = `${w.text}${day.precipProb !== null ? ` · осадки ${day.precipProb}%` : ''} · ветер до ${Math.round(day.windMax)} м/с`;
  return (
    <section className={`${s.card} ${s.text} ${s.weather}`} aria-labelledby={`weather-${date}`}>
      <h3 id={`weather-${date}`} className={s.cardTitle}>
        <Icon name={KIND_ICON[w.kind]} />
        Погода на день
      </h3>
      <div className={s.weatherMain}>
        <Icon name={KIND_ICON[isToday ? nowW.kind : w.kind]} className={s.weatherBig} />
        {isToday ? (
          <div>
            <p className={s.weatherTemp}>
              {formatTemp(weather!.now.temp)} <span>сейчас, {nowW.text}</span>
            </p>
            <p className={s.weatherText}>
              За день: {range}, {details}
            </p>
          </div>
        ) : (
          <div>
            <p className={s.weatherTemp}>{range}</p>
            <p className={s.weatherText}>{details}</p>
          </div>
        )}
      </div>
      <ul className={s.weatherTips}>
        {weatherTips(day).map((t) => (
          <li key={t}>{t}</li>
        ))}
        {day.sunset && <li>Закат в {day.sunset}.</li>}
      </ul>
    </section>
  );
}

/** «Сейчас в Калининграде» для шапки. */
export function WeatherNowChip({ weather }: { weather: Weather | null }) {
  if (!weather) return null;
  const w = describeWeather(weather.now.code);
  return (
    <p className={a.weatherNow}>
      <Icon name={KIND_ICON[w.kind]} />
      <span>
        Сейчас в Калининграде <strong>{formatTemp(weather.now.temp)}</strong>, {w.text}
        <span className={a.weatherMeta}>
          {' '}
          · ощущается как {formatTemp(weather.now.feels)} · ветер {Math.round(weather.now.wind)} м/с
        </span>
      </span>
    </p>
  );
}
