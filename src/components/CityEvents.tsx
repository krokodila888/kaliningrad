import type { CityEvent, IsoDate } from '../types';
import { isEventPast } from '../lib/time';
import { Icon } from './icons';
import s from './Cell.module.css';

export function CityEvents({ date, events, now }: { date: IsoDate; events: CityEvent[]; now: Date }) {
  return (
    <section className={`${s.card} ${s.text}`} aria-labelledby={`events-${date}`}>
      <h3 id={`events-${date}`} className={s.cardTitle}>
        <Icon name="ticket" />
        Сегодня в городе
      </h3>
      <ul className={s.events}>
        {events.map((e, i) => {
          const past = isEventPast(date, e.time, now);
          return (
            <li key={i} className={`${s.event} ${past ? s.eventPast : ''}`}>
              <span className={s.eventTime}>{e.time ?? 'весь день'}</span>
              <span>
                <span className={s.eventTitle}>
                  {e.link ? (
                    <a href={e.link} target="_blank" rel="noopener noreferrer">
                      {e.title}
                    </a>
                  ) : (
                    e.title
                  )}
                </span>
                {past && <span className="visually-hidden"> (уже прошло)</span>}
                <span className={s.eventMeta}>
                  <br />
                  {e.place}
                  {e.price ? ` · ${e.price}` : ''}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className={s.caption}>Время лучше проверить на сайте площадки.</p>
    </section>
  );
}
