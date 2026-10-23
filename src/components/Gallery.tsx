import type { CellImage } from '../types';
import s from './Cell.module.css';

function Credit({ image }: { image: CellImage }) {
  if (!image.caption && !image.credit) return null;
  const c = image.credit;
  return (
    <figcaption className={s.figcaption}>
      {image.caption}
      {c && (
        <span className={s.credit}>
          {image.caption ? ' · ' : ''}
          <a href={c.url} target="_blank" rel="noopener noreferrer">
            {c.author ? `${c.author}, ` : ''}
            {c.license}
          </a>
        </span>
      )}
    </figcaption>
  );
}

/** Первая картинка — крупно, остальные — сеткой ниже. */
export function Gallery({ images, position }: { images: CellImage[]; position: 'lead' | 'rest' }) {
  const list = position === 'lead' ? images.slice(0, 1) : images.slice(1);
  if (list.length === 0) return null;
  const base = import.meta.env.BASE_URL;
  return (
    <div className={position === 'lead' ? s.lead : `${s.gallery} ${s.text}`}>
      {list.map((img) => (
        <figure key={img.src} className={s.figure}>
          <img
            className={s.photo}
            src={`${base}img/${img.src}`}
            alt={img.alt}
            loading={position === 'lead' ? 'eager' : 'lazy'}
            decoding="async"
          />
          <Credit image={img} />
        </figure>
      ))}
    </div>
  );
}
