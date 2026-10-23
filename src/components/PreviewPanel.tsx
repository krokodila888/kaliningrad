import type { IsoDate } from '../types';
import { dateForDay, dayForDate } from '../lib/calendar';
import s from '../App.module.css';

interface Props {
  simDate: IsoDate | null;
  realToday: IsoDate;
  openAll: boolean;
  onSimDate: (d: IsoDate | null) => void;
  onOpenAll: (v: boolean) => void;
}

/** Панель автора: открыть все ячейки и «перемотать» дату. */
export function PreviewPanel({ simDate, realToday, openAll, onSimDate, onOpenAll }: Props) {
  const current = simDate ?? realToday;
  const shift = (n: number) => onSimDate(dateForDay(dayForDate(current) + n));
  return (
    <div className={s.preview} role="region" aria-label="Режим автора">
      <strong>Режим автора</strong>
      <label>
        <input type="checkbox" checked={openAll} onChange={(e) => onOpenAll(e.target.checked)} />
        все ячейки открыты
      </label>
      <label>
        дата
        <input
          type="date"
          value={current}
          min="2026-10-01"
          max="2026-12-31"
          onChange={(e) => onSimDate(e.target.value || null)}
        />
      </label>
      <button type="button" onClick={() => shift(-1)} aria-label="На день назад">
        −1
      </button>
      <button type="button" onClick={() => shift(1)} aria-label="На день вперёд">
        +1
      </button>
      {simDate && (
        <button type="button" onClick={() => onSimDate(null)}>
          сегодня
        </button>
      )}
    </div>
  );
}
