import type { CellType, IsoDate } from '../types';
import { ALL_DAYS, dateForDay, defaultTypeFor, formatDate } from '../lib/calendar';
import { sealedFor } from '../lib/cells';
import { Icon, TYPE_LABEL, TypeIcon } from './icons';
import s from '../App.module.css';

export type TileState = 'locked' | 'unread' | 'read';

interface Props {
  today: IsoDate;
  selected: IsoDate | null;
  isUnlocked: (day: number) => boolean;
  seen: Record<IsoDate, string>;
  onOpen: (date: IsoDate) => void;
  onLocked: (date: IsoDate) => void;
}

export function typeFor(date: IsoDate): CellType {
  return sealedFor(date)?.type ?? defaultTypeFor(date);
}

export function Grid({ today, selected, isUnlocked, seen, onOpen, onLocked }: Props) {
  return (
    <ol className={s.grid} aria-label="Ячейки календаря">
      {ALL_DAYS.map((day) => {
        const date = dateForDay(day);
        const type = typeFor(date);
        const unlocked = isUnlocked(day);
        const state: TileState = !unlocked ? 'locked' : seen[date] ? 'read' : 'unread';
        const f = formatDate(date);
        const isToday = date === today;
        const stateText = state === 'locked' ? 'закрыта' : state === 'read' ? 'прочитана' : 'новая';
        const cls = [
          s.tile,
          s[state],
          isToday ? s.today : '',
          selected === date ? s.selected : '',
          type === 'birthday' ? s.birthday : '',
        ].join(' ');
        return (
          <li key={date}>
            <button
              type="button"
              className={cls}
              data-date={date}
              aria-disabled={!unlocked}
              aria-current={isToday ? 'date' : undefined}
              aria-label={`${f.dayNum} ${f.month}, ${TYPE_LABEL[type]}, ${stateText}${isToday ? ', сегодня' : ''}`}
              onClick={() => (unlocked ? onOpen(date) : onLocked(date))}
            >
              {isToday && <span className={s.todayTag}>сегодня</span>}
              <span className={s.tileTop}>
                <span className={s.tileNum}>{f.dayNum}</span>
                <TypeIcon type={type} className={s.tileIcon} />
              </span>
              <span className={s.tileMeta}>
                <span className={s.tileMonth}>{f.month}</span>
                {f.weekdayShort}
              </span>
              {state === 'read' && (
                <span className={s.tileBadge}>
                  <Icon name="check" />
                </span>
              )}
              {state === 'unread' && <span className={s.tileBadge}>новая</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
