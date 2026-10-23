import { useEffect, useState, type CSSProperties } from 'react';
import { prefersReducedMotion } from '../lib/motion';
import s from './Cell.module.css';

const COLORS = ['#f2b544', '#a23b2a', '#16324f', '#f6efe2', '#ec8a72', '#7ccaa1'];
const PIECES = 70;

/** Конфетти на чистом CSS. Если включено «уменьшение движения» — не показываем вовсе. */
export function Confetti() {
  const [visible, setVisible] = useState(() => !prefersReducedMotion());

  useEffect(() => {
    if (!visible) return;
    const id = window.setTimeout(() => setVisible(false), 5200);
    return () => clearTimeout(id);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={s.confetti} aria-hidden="true">
      {Array.from({ length: PIECES }, (_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          background: COLORS[i % COLORS.length],
          animationDuration: `${2.6 + Math.random() * 2.2}s`,
          animationDelay: `${Math.random() * 0.8}s`,
          '--dx': `${(Math.random() - 0.5) * 160}px`,
          '--rot': `${360 + Math.random() * 720}deg`,
        } as CSSProperties;
        return <i key={i} style={style} />;
      })}
    </div>
  );
}
