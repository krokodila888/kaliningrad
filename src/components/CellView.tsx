import { useEffect, useRef } from 'react';
import type { Cell, IsoDate } from '../types';
import { dayForDate, defaultTypeFor, formatDateLong, TOTAL_DAYS } from '../lib/calendar';
import { homlinById, useCell } from '../lib/cells';
import { renderMarkdown } from '../lib/markdown';
import { progressStore, useProgress } from '../lib/progress';
import { kaliningradDate } from '../lib/time';
import { Icon, TYPE_LABEL, TypeIcon } from './icons';
import { CityEvents } from './CityEvents';
import { GiftBox } from './GiftBox';
import { Confetti } from './Confetti';
import s from './Cell.module.css';

interface Props {
  date: IsoDate;
  unlocked: boolean;
  now: Date;
  onClose: () => void;
}

function daysBetween(a: IsoDate, b: IsoDate): number {
  return dayForDate(b) - dayForDate(a);
}

function pluralDays(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return `${n} день`;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} дня`;
  return `${n} дней`;
}

function TopBar({ onClose }: { onClose: () => void }) {
  return (
    <div className={s.topBar}>
      <button type="button" className={s.backBtn} onClick={onClose}>
        <Icon name="back" />
        Календарь
      </button>
    </div>
  );
}

export function CellView({ date, unlocked, now, onClose }: Props) {
  const day = dayForDate(date);
  const inRange = day >= 1 && day <= TOTAL_DAYS;

  if (!inRange) {
    return (
      <div className={s.cell}>
        <TopBar onClose={onClose} />
        <div className={s.state}>
          <Icon name="anchor" className={s.stateIcon} />
          <h2 tabIndex={-1} data-autofocus>
            Такой ячейки нет
          </h2>
          <p>Календарь идёт с 24 октября по 24 ноября. Вернись к сетке — там все дни.</p>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    const left = daysBetween(kaliningradDate(now), date);
    const type = defaultTypeFor(date);
    return (
      <div className={s.cell}>
        <TopBar onClose={onClose} />
        <div className={s.state}>
          <TypeIcon type={type} className={s.stateIcon} />
          <h2 tabIndex={-1} data-autofocus>
            Откроется {formatDateLong(date)}
          </h2>
          <p>
            {left === 1 ? 'Уже завтра!' : `Ещё ${pluralDays(left)}.`} Ячейка откроется в полночь по калининградскому
            времени.
          </p>
        </div>
      </div>
    );
  }

  return <OpenCell date={date} now={now} onClose={onClose} />;
}

function OpenCell({ date, now, onClose }: { date: IsoDate; now: Date; onClose: () => void }) {
  const state = useCell(date);

  if (state.status === 'loading') {
    return (
      <div className={s.cell} aria-busy="true">
        <TopBar onClose={onClose} />
        <div className={s.body}>
          <span className="visually-hidden">Открываем ячейку…</span>
          <div className={s.skeleton} style={{ width: '40%' }} />
          <div className={s.skeleton} style={{ width: '80%', height: 32 }} />
          <div className={s.skeleton} />
          <div className={s.skeleton} />
          <div className={s.skeleton} style={{ width: '60%' }} />
        </div>
      </div>
    );
  }

  if (state.status === 'empty') {
    return (
      <div className={s.cell}>
        <TopBar onClose={onClose} />
        <div className={s.state}>
          <Icon name="gift" className={s.stateIcon} />
          <h2 tabIndex={-1} data-autofocus>
            Ячейка ещё упаковывается
          </h2>
          <p>Её содержимое вот-вот появится. Загляни сюда чуть позже — она никуда не денется.</p>
        </div>
      </div>
    );
  }

  return <CellContent cell={state.cell} now={now} onClose={onClose} />;
}

function CellContent({ cell, now, onClose }: { cell: Cell; now: Date; onClose: () => void }) {
  const progress = useProgress();
  const homlin = cell.homlin ? homlinById(cell.homlin) : undefined;
  const homlinFound = cell.homlin ? !!progress.homlinsFound[cell.homlin] : false;
  const taskDone = !!progress.tasksDone[cell.date];
  const isBirthday = cell.type === 'birthday';
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    progressStore.markSeen(cell.date);
  }, [cell.date]);

  const toggleHomlin = () => cell.homlin && progressStore.setHomlinFound(cell.homlin, !homlinFound);
  const toggleTask = () => progressStore.setTaskDone(cell.date, !taskDone);

  const mapUrl = cell.practical.mapUrl;
  const p = cell.practical;
  const hasPractical = p.address || p.hours || p.price || p.distanceFromHome || mapUrl;

  return (
    <article className={`${s.cell} ${isBirthday ? s.birthday : ''}`} aria-labelledby={`title-${cell.date}`}>
      {isBirthday && <Confetti key={cell.date} />}
      <TopBar onClose={onClose} />

      <div className={s.body}>
        <header className={s.text}>
          <p className={s.kicker}>
            <span className={s.chip}>
              <TypeIcon type={cell.type} />
              {TYPE_LABEL[cell.type]}
            </span>
            <span>
              {formatDateLong(cell.date)} · день {cell.day} из {TOTAL_DAYS}
            </span>
          </p>
          <h2 id={`title-${cell.date}`} className={s.title} ref={headingRef} tabIndex={-1} data-autofocus>
            {cell.title}
          </h2>
        </header>

        {cell.image && (
          <img
            className={s.image}
            src={`${import.meta.env.BASE_URL}img/${cell.image.src}`}
            alt={cell.image.alt}
            loading="lazy"
          />
        )}

        <div className={`${s.text} ${s.story}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(cell.story) }} />

        {cell.gift && <GiftBox date={cell.date} gift={cell.gift} />}

        {cell.task && (
          <section className={`${s.card} ${s.text}`} aria-labelledby={`task-${cell.date}`}>
            <h3 id={`task-${cell.date}`} className={s.cardTitle}>
              <Icon name="check" />
              Задание
            </h3>
            <div className={s.taskText} dangerouslySetInnerHTML={{ __html: renderMarkdown(cell.task.text) }} />
            <button
              type="button"
              className={`${s.bigBtn} ${taskDone ? s.done : s.secondary}`}
              aria-pressed={taskDone}
              onClick={toggleTask}
            >
              {taskDone ? <Icon name="check" /> : null}
              {taskDone ? 'Сделала' : 'Сделала!'}
            </button>
            {taskDone && <p className={s.hint}>Нажми ещё раз, если хочешь снять отметку</p>}
            {taskDone && cell.task.answer && (
              <div className={s.answer}>
                <strong>Ответ</strong>
                {cell.task.answer}
              </div>
            )}
          </section>
        )}

        {homlin && (
          <section className={`${s.card} ${s.homlinCard} ${s.text}`} aria-labelledby={`homlin-${cell.date}`}>
            <h3 id={`homlin-${cell.date}`} className={s.cardTitle}>
              <Icon name="pin" />
              {homlinFound ? homlin.name : 'Загадка хомлина'}
            </h3>
            <p className={s.riddle}>«{homlin.riddle}»</p>
            <button
              type="button"
              className={`${s.bigBtn} ${homlinFound ? s.done : s.primary}`}
              aria-pressed={homlinFound}
              onClick={toggleHomlin}
            >
              {homlinFound ? <Icon name="check" /> : null}
              {homlinFound ? 'Нашла' : 'Нашла!'}
            </button>
            {homlinFound && (
              <div className={s.answer}>
                <strong>{homlin.place}</strong>
                {homlin.revealText}
              </div>
            )}
            {homlinFound && <p className={s.hint}>Нажми ещё раз, если хочешь снять отметку</p>}
          </section>
        )}

        {hasPractical && (
          <section className={`${s.card} ${s.text}`} aria-labelledby={`practical-${cell.date}`}>
            <h3 id={`practical-${cell.date}`} className={s.cardTitle}>
              <Icon name="map" />
              Практичное
            </h3>
            <dl className={s.facts}>
              {p.address && (
                <div className={s.fact}>
                  <Icon name="pin" />
                  <dt>Адрес</dt>
                  <dd>{p.address}</dd>
                </div>
              )}
              {p.distanceFromHome && (
                <div className={s.fact}>
                  <Icon name="walk" />
                  <dt>От дома</dt>
                  <dd>{p.distanceFromHome}</dd>
                </div>
              )}
              {p.hours && (
                <div className={s.fact}>
                  <Icon name="clock" />
                  <dt>Часы</dt>
                  <dd>{p.hours}</dd>
                </div>
              )}
              {p.price && (
                <div className={s.fact}>
                  <Icon name="ticket" />
                  <dt>Цена</dt>
                  <dd>{p.price}</dd>
                </div>
              )}
            </dl>
            {mapUrl && (
              <a
                className={`${s.bigBtn} ${s.primary} ${s.inlineMap}`}
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="map" />
                Открыть в Яндекс Картах
              </a>
            )}
          </section>
        )}

        {cell.events && cell.events.length > 0 && (
          <CityEvents date={cell.date} events={cell.events} now={now} />
        )}
      </div>

      {(mapUrl || homlin || cell.task) && (
        <div className={s.actionBar}>
          {mapUrl && (
            <a className={`${s.bigBtn} ${s.primary}`} href={mapUrl} target="_blank" rel="noopener noreferrer">
              <Icon name="map" />
              На карте
            </a>
          )}
          {homlin ? (
            <button
              type="button"
              className={`${s.bigBtn} ${homlinFound ? s.done : s.secondary}`}
              aria-pressed={homlinFound}
              onClick={toggleHomlin}
            >
              {homlinFound ? <Icon name="check" /> : null}
              {homlinFound ? 'Нашла' : 'Нашла!'}
            </button>
          ) : cell.task ? (
            <button
              type="button"
              className={`${s.bigBtn} ${taskDone ? s.done : s.secondary}`}
              aria-pressed={taskDone}
              onClick={toggleTask}
            >
              {taskDone ? <Icon name="check" /> : null}
              {taskDone ? 'Сделала' : 'Сделала!'}
            </button>
          ) : null}
        </div>
      )}
    </article>
  );
}
