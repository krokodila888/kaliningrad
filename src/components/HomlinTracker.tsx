import type { HomlinId, IsoDate, Progress } from '../types';
import { dateForDay } from '../lib/calendar';
import { homlinDays, homlins } from '../lib/cells';
import { HomlinSilhouette, Icon } from './icons';
import s from '../App.module.css';

interface Props {
  progress: Progress;
  isUnlocked: (day: number) => boolean;
  onOpen: (date: IsoDate) => void;
  onBonus: () => void;
}

export function HomlinTracker({ progress, isUnlocked, onOpen, onBonus }: Props) {
  if (homlins.length === 0) return null;
  const found = homlins.filter((h) => progress.homlinsFound[h.id]).length;
  const all = found === homlins.length;

  return (
    <section className={s.tracker} aria-labelledby="homlins-title">
      <h2 id="homlins-title" className={s.trackerTitle}>
        Семья хомлинов
        <span className={s.trackerCount}>
          найдено {found} из {homlins.length}
        </span>
      </h2>
      <ul className={s.trackerList}>
        {homlins.map((h) => {
          const isFound = !!progress.homlinsFound[h.id];
          const day = homlinDays[h.id as HomlinId];
          const canOpen = day !== undefined && isUnlocked(day);
          const hint = isFound ? h.name : day ? `загадка в ячейке ${day}` : 'загадка впереди';
          const shortHint = isFound ? h.name.split(' ').pop() : day ? `ячейка ${day}` : 'впереди';
          const content = (
            <>
              <HomlinSilhouette className={s.homlinFigure} />
              <span className={s.hintShort} aria-hidden="true">
                {shortHint}
              </span>
              <span className={s.hintLong} aria-hidden="true">
                {hint}
              </span>
            </>
          );
          const cls = `${s.homlinItem} ${isFound ? s.homlinFound : ''}`;
          return (
            <li key={h.id}>
              {canOpen ? (
                <button
                  type="button"
                  className={cls}
                  onClick={() => onOpen(dateForDay(day))}
                  aria-label={isFound ? `${h.name} — найден` : `Хомлин не найден, ${hint}`}
                >
                  {content}
                </button>
              ) : (
                <div className={cls} aria-label={isFound ? `${h.name} — найден` : `Хомлин не найден, ${hint}`} role="img">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {all && (
        <button type="button" className={`${s.btn} ${s.btnPrimary} ${s.bonusLink}`} onClick={onBonus}>
          <Icon name="gift" />
          Вся семья в сборе — открыть бонус
        </button>
      )}
    </section>
  );
}

export function HomlinBonus({ progress, onClose }: { progress: Progress; onClose: () => void }) {
  const all = homlins.length > 0 && homlins.every((h) => progress.homlinsFound[h.id]);
  return (
    <div className={s.feed}>
      <div className={s.feedTop}>
        <button type="button" className={s.iconBtn} onClick={onClose} aria-label="Вернуться к календарю">
          <Icon name="back" />
        </button>
        <h2 className={s.sectionTitle} style={{ margin: 0 }} tabIndex={-1} data-autofocus>
          {all ? 'Вся семья в сборе!' : 'Семья хомлинов'}
        </h2>
      </div>
      {all ? (
        <>
          <p>
            Зёбра, ты нашла всех семерых! Последняя точка — кафе-лавка «Хомлины» на ул. Степана Разина, 24: там вся
            семья живёт в интерьере. Потри любую фигурку и загадай желание — говорят, сбывается.
          </p>
          <ul className={s.feedList}>
            {homlins.map((h) => (
              <li key={h.id} className={s.feedItem} style={{ cursor: 'default' }}>
                <HomlinSilhouette className={`${s.homlinFigure}`} />
                <span>
                  <span className={s.feedTitle}>{h.name}</span>
                  <span className={s.feedDate}>
                    {h.place}. {h.revealText}
                  </span>
                </span>
                <span />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Бонус откроется, когда найдутся все семеро. Загадки спрятаны в ячейках календаря.</p>
      )}
    </div>
  );
}
