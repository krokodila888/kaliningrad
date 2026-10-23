import type { IsoDate } from '../types';
import { ALL_DAYS, dateForDay, formatDateLong } from '../lib/calendar';
import { useCells } from '../lib/cells';
import { Icon, TYPE_LABEL, TypeIcon } from './icons';
import { typeFor } from './Grid';
import s from '../App.module.css';

interface Props {
  isUnlocked: (day: number) => boolean;
  seen: Record<IsoDate, string>;
  onOpen: (date: IsoDate) => void;
  onClose: () => void;
}

/** «Все открытые» — лента ячеек по датам, чтобы перечитывать. */
export function Feed({ isUnlocked, seen, onOpen, onClose }: Props) {
  const dates = ALL_DAYS.filter(isUnlocked).map(dateForDay);
  const cells = useCells(dates);

  return (
    <div className={s.feed}>
      <div className={s.feedTop}>
        <button type="button" className={s.iconBtn} onClick={onClose} aria-label="Вернуться к календарю">
          <Icon name="back" />
        </button>
        <h2 className={s.sectionTitle} style={{ margin: 0 }} tabIndex={-1} data-autofocus>
          Все открытые
        </h2>
      </div>
      {dates.length === 0 ? (
        <p>Первая ячейка откроется 24 октября.</p>
      ) : (
        <ul className={s.feedList}>
          {dates.map((date) => {
            const type = typeFor(date);
            const title = cells.get(date)?.title ?? TYPE_LABEL[type];
            return (
              <li key={date}>
                <button type="button" className={s.feedItem} onClick={() => onOpen(date)}>
                  <TypeIcon type={type} className={s.feedIcon} />
                  <span>
                    <span className={s.feedDate}>{formatDateLong(date)}</span>
                    <span className={s.feedTitle}>{title}</span>
                  </span>
                  {seen[date] ? (
                    <span className={`${s.feedState} ${s.isRead}`}>✓ прочитано</span>
                  ) : (
                    <span className={`${s.feedState} ${s.isNew}`}>новая</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
