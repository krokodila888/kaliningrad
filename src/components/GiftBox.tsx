import { useEffect, useRef, useState } from 'react';
import type { Gift, IsoDate } from '../types';
import { progressStore } from '../lib/progress';
import { renderMarkdown } from '../lib/markdown';
import { prefersReducedMotion } from '../lib/motion';
import { Icon } from './icons';
import s from './Cell.module.css';

type Phase = 'closed' | 'opening' | 'open';

const OPEN_MS = 1700;

export function GiftBox({ date, gift }: { date: IsoDate; gift: Gift }) {
  // Решаем один раз при монтировании: при первом открытии — анимация, потом — сразу содержимое.
  const [firstTime] = useState(() => !progressStore.get().unwrapped[date]);
  const [phase, setPhase] = useState<Phase>(firstTime ? 'closed' : 'open');
  const timers = useRef<number[]>([]);

  const unwrap = () => {
    timers.current.forEach(clearTimeout);
    if (prefersReducedMotion()) {
      setPhase('open');
      progressStore.markUnwrapped(date);
      return;
    }
    setPhase('closed');
    timers.current = [
      window.setTimeout(() => setPhase('opening'), 350),
      window.setTimeout(() => {
        setPhase('open');
        progressStore.markUnwrapped(date);
      }, 350 + OPEN_MS),
    ];
  };

  useEffect(() => {
    if (firstTime) unwrap();
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={`${s.card} ${s.gift} ${s.text}`} aria-labelledby={`gift-${date}`} aria-live="polite">
      <h3 id={`gift-${date}`} className={s.cardTitle}>
        <Icon name="gift" />
        Тут подарок
      </h3>

      {phase !== 'open' ? (
        <div className={`${s.box} ${phase === 'opening' ? s.opening : ''}`} role="img" aria-label="Подарок распаковывается">
          <div className={s.boxBase} />
          <div className={s.boxLid} />
          <div className={s.ribbonV} />
          <div className={s.ribbonH} />
          <div className={s.bow} />
        </div>
      ) : (
        <div className={s.giftContent}>
          <h4 className={`${s.giftTitle}`}>{gift.title}</h4>
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(gift.description) }} />
          {gift.image && (
            <img
              className={s.giftImage}
              src={`${import.meta.env.BASE_URL}img/${gift.image.src}`}
              alt={gift.image.alt}
              loading="lazy"
            />
          )}
          {gift.code && (
            <p>
              Код: <span className={s.code}>{gift.code}</span>
            </p>
          )}
          <div className={s.giftButtons}>
            {gift.link && (
              <a className={`${s.bigBtn} ${s.primary}`} href={gift.link} target="_blank" rel="noopener noreferrer">
                <Icon name="gift" />
                Открыть подарок
              </a>
            )}
            <button type="button" className={s.linkBtn} onClick={unwrap}>
              Распаковать ещё раз
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
