import { useCallback, useEffect, useRef, useState } from 'react';
import type { IsoDate } from './types';
import { BIRTHDAY, END_DATE, FRIEND_NAME, START_DATE, TOTAL_DAYS, dayForDate, formatDate, formatDateLong } from './lib/calendar';
import { isUnlocked as isUnlockedAt, kaliningradDate } from './lib/time';
import { noonInKaliningrad, useNow } from './lib/clock';
import { useProgress } from './lib/progress';
import { navigate, parseHash, useHash } from './lib/router';
import { usePreviewMode } from './lib/preview';
import { Grid } from './components/Grid';
import { CellView } from './components/CellView';
import { Feed } from './components/Feed';
import { HomlinBonus, HomlinTracker } from './components/HomlinTracker';
import { PreviewPanel } from './components/PreviewPanel';
import { Icon } from './components/icons';
import s from './App.module.css';

function greeting(today: IsoDate): string {
  if (today < START_DATE) return `${FRIEND_NAME}, календарь начнётся 24 октября — совсем скоро!`;
  if (today > END_DATE) return `${FRIEND_NAME}, все 32 дня позади — но ячейки остаются с тобой, перечитывай сколько хочется.`;
  if (today === BIRTHDAY) return `С днём рождения, ${FRIEND_NAME}! Сегодня ячейка особенная.`;
  const day = dayForDate(today);
  if (day === TOTAL_DAYS) return `${FRIEND_NAME}, сегодня последний день календаря. Спасибо, что гуляла с ним весь месяц.`;
  return `${FRIEND_NAME}, сегодня день ${day} из ${TOTAL_DAYS}. Каждый день в полночь открывается новая ячейка — а открытые остаются с тобой насовсем.`;
}

export function App() {
  const preview = usePreviewMode();
  const realNow = useNow();
  const [simDate, setSimDate] = useState<IsoDate | null>(null);
  const [openAll, setOpenAll] = useState(true);
  const now = preview && simDate ? noonInKaliningrad(simDate) : realNow;
  const today = kaliningradDate(now);
  const progress = useProgress();
  const route = parseHash(useHash());
  const [toast, setToast] = useState<string | null>(null);
  const paneRef = useRef<HTMLElement>(null);
  const lastTile = useRef<IsoDate | null>(null);

  const isUnlocked = useCallback(
    (day: number) => (preview && openAll) || isUnlockedAt(day, now),
    [preview, openAll, now],
  );

  const showToast = (text: string) => setToast(text);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  const openDay = (date: IsoDate) => {
    lastTile.current = date;
    navigate({ name: 'day', date });
  };
  const close = useCallback(() => navigate({ name: 'home' }), []);

  const goToday = () => {
    if (today < START_DATE) return showToast('Календарь начнётся 24 октября');
    openDay(today > END_DATE ? END_DATE : today);
  };

  const onLocked = (date: IsoDate) => {
    const f = formatDate(date);
    showToast(`Эта ячейка откроется ${f.dayNum} ${f.month}`);
  };

  const overlay = route.name !== 'home';

  // Фокус и прокрутка при открытии/закрытии панели
  useEffect(() => {
    if (overlay) {
      paneRef.current?.scrollTo({ top: 0 });
      let tries = 0;
      const id = window.setInterval(() => {
        const el = paneRef.current?.querySelector<HTMLElement>('[data-autofocus]');
        if (el || ++tries > 20) {
          el?.focus({ preventScroll: true });
          clearInterval(id);
        }
      }, 50);
      return () => clearInterval(id);
    }
    if (lastTile.current) {
      document.querySelector<HTMLElement>(`[data-date="${lastTile.current}"]`)?.focus();
    }
  }, [overlay, route.name === 'day' ? route.date : route.name]);

  // На телефоне и планшете панель перекрывает экран — фон не прокручиваем
  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 1023px)').matches;
    document.body.classList.toggle('no-scroll', overlay && narrow);
    return () => document.body.classList.remove('no-scroll');
  }, [overlay]);

  useEffect(() => {
    if (!overlay) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlay, close]);

  const selected = route.name === 'day' ? route.date : null;

  return (
    <div className={s.app}>
      <header className={s.header}>
        <div className={s.headerInner}>
          <p className={s.eyebrow}>Уральская, 10 · {formatDateLong(today)}</p>
          <h1 className={s.title}>
            Калининградский <em>адвент</em>
          </h1>
          <p className={s.greeting}>{greeting(today)}</p>
          <div className={s.actions}>
            <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={goToday}>
              <Icon name="gift" />
              Сегодня
            </button>
            <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={() => navigate({ name: 'all' })}>
              Все открытые
            </button>
          </div>
        </div>
      </header>

      <HomlinTracker
        progress={progress}
        isUnlocked={isUnlocked}
        onOpen={openDay}
        onBonus={() => navigate({ name: 'homlins' })}
      />

      <main className={s.layout}>
        <section aria-labelledby="calendar-title">
          <h2 id="calendar-title" className={`${s.sectionTitle} visually-hidden`}>
            Календарь
          </h2>
          <Grid
            today={today}
            selected={selected}
            isUnlocked={isUnlocked}
            seen={progress.seen}
            onOpen={openDay}
            onLocked={onLocked}
          />
        </section>

        {overlay && <button type="button" className={s.backdropOpen} aria-label="Закрыть" onClick={close} tabIndex={-1} />}

        <aside
          ref={paneRef}
          className={overlay ? s.paneOpen : s.pane}
          aria-label={overlay ? 'Открытая ячейка' : undefined}
          role={overlay ? 'dialog' : undefined}
        >
          {route.name === 'day' && (
            <CellView
              key={route.date}
              date={route.date}
              unlocked={isUnlocked(dayForDate(route.date))}
              now={now}
              onClose={close}
            />
          )}
          {route.name === 'all' && (
            <Feed isUnlocked={isUnlocked} seen={progress.seen} onOpen={openDay} onClose={close} />
          )}
          {route.name === 'homlins' && <HomlinBonus progress={progress} onClose={close} />}
          {route.name === 'home' && (
            <div className={s.welcome}>
              <h2>Выбери ячейку</h2>
              <p>
                Новые ячейки подсвечены янтарём, прочитанные отмечены галочкой — их можно открывать снова сколько угодно.
                Ссылки на карты откроются в новой вкладке.
              </p>
              <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={goToday}>
                <Icon name="gift" />
                Открыть сегодняшнюю
              </button>
            </div>
          )}
        </aside>
      </main>

      <footer className={s.footer}>Сделано с любовью для {FRIEND_NAME} · Калининград, осень 2026</footer>

      {preview && (
        <PreviewPanel
          simDate={simDate}
          realToday={kaliningradDate(realNow)}
          openAll={openAll}
          onSimDate={setSimDate}
          onOpenAll={setOpenAll}
        />
      )}

      <div aria-live="polite" className={toast ? s.toast : 'visually-hidden'}>
        {toast}
      </div>
    </div>
  );
}
