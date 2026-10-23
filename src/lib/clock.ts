import { useEffect, useState } from 'react';
import type { IsoDate } from '../types';

/** Текущее время, обновляется раз в 30 секунд — чтобы ячейка открылась ровно в полночь без перезагрузки. */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') setNow(new Date());
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return now;
}

/** Полдень указанного калининградского дня (UTC+2) — для «перемотки» в режиме автора. */
export function noonInKaliningrad(date: IsoDate): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 10, 0));
}
