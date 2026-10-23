import type { CellType } from '../types';

type IconProps = { className?: string; title?: string };

function Svg({ className, title, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {children}
    </svg>
  );
}

const paths: Record<string, React.ReactNode> = {
  anchor: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v14M8 10h8M4.5 13.5A7.5 7.5 0 0 0 12 21a7.5 7.5 0 0 0 7.5-7.5" />
      <path d="M3 15l1.5-1.5L6 15M18 15l1.5-1.5L21 15" />
    </>
  ),
  cup: (
    <>
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M3 21h15" />
      <path d="M8 3c0 1.5 1.5 1.5 1.5 3M12 3c0 1.5 1.5 1.5 1.5 3" />
    </>
  ),
  boot: (
    <>
      <path d="M6 3h6v8l6.5 2.5A3 3 0 0 1 20.5 16v2H4V5a2 2 0 0 1 2-2z" />
      <path d="M4 21h16.5M12 7h-2M12 10h-2M15 12.5l-1 2M18 13.5l-1 2" />
    </>
  ),
  column: (
    <>
      <path d="M4 7h16M5 4h14l1 3H4zM6 7v11M10 7v11M14 7v11M18 7v11M4 18h16M3 21h18" />
    </>
  ),
  frame: (
    <>
      <rect x="3" y="5" width="18" height="15" rx="1" />
      <rect x="6" y="8" width="12" height="9" />
      <path d="M6 17l4-4 3 3 2-2 3 3M12 2l-3 3M12 2l3 3" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v9h14v-9M12 8v13" />
      <path d="M12 8c-1.5-3-5-4-5.5-2S9 8 12 8zM12 8c1.5-3 5-4 5.5-2S15 8 12 8z" />
    </>
  ),
  train: (
    <>
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 10h14M9 6.5h6" />
      <circle cx="9" cy="13.5" r="1" />
      <circle cx="15" cy="13.5" r="1" />
      <path d="M8 17l-2 4M16 17l2 4M7 19.5h10" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19C5 10 10 4 20 4c0 10-6 15-15 15z" />
      <path d="M5 19l9-9M9 15h4M11 13V9" />
    </>
  ),
  cake: (
    <>
      <path d="M4 13h16v8H4zM6 10h12v3H6z" />
      <path d="M4 16c2 1.5 3.5 1.5 5.3 0s3.4-1.5 5.3 0 3.5 1.5 5.4 0" />
      <path d="M9 10V7M12 10V7M15 10V7" />
      <path d="M9 5.5c-.6-.6 0-1.6 0-2.5.8.7 1 1.8 0 2.5zM12 5.5c-.6-.6 0-1.6 0-2.5.8.7 1 1.8 0 2.5zM15 5.5c-.6-.6 0-1.6 0-2.5.8.7 1 1.8 0 2.5z" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  map: (
    <>
      <path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  back: <path d="M15 5l-7 7 7 7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  walk: (
    <>
      <circle cx="13" cy="4" r="1.8" />
      <path d="M9 21l3-6 2 2v4M10 10l2-3 3 3 3 1M12 7l-1.5 6.5" />
    </>
  ),
  ticket: (
    <>
      <path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z" transform="translate(0 2)" />
      <path d="M14 6v12" strokeDasharray="2 2" />
    </>
  ),
  pin: (
    <>
      <path d="M4 21h16M6 21V10l6-6 6 6v11" />
      <path d="M10 21v-5h4v5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
  partly: (
    <>
      <path d="M8 3.5v1.2M3.2 8.3h1.2M4.6 4.9l.9.9M11.4 4.9l-.9.9" />
      <path d="M5.4 10.5a3.2 3.2 0 0 1 5.9-2.2" />
      <path d="M8 19h10a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.2A3 3 0 0 0 8 19z" />
    </>
  ),
  cloud: <path d="M7 18h11a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18z" />,
  fog: (
    <>
      <path d="M7 12h11a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 12z" transform="translate(0 2)" />
      <path d="M4 18h16M6 21h12" />
    </>
  ),
  rain: (
    <>
      <path d="M7 14h11a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 14z" />
      <path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3" />
    </>
  ),
  snow: (
    <>
      <path d="M7 14h11a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 14z" />
      <path d="M8 18h.01M12 20h.01M16 18h.01M10 22h.01M14 22h.01" strokeWidth={2.6} />
    </>
  ),
  storm: (
    <>
      <path d="M7 14h11a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 14z" />
      <path d="M12.5 14l-2 4h3l-2 4" />
    </>
  ),
};

export type IconName = keyof typeof paths;

export function Icon({ name, ...rest }: IconProps & { name: IconName }) {
  return <Svg {...rest}>{paths[name]}</Svg>;
}

export const TYPE_ICON: Record<CellType, IconName> = {
  intro: 'anchor',
  history: 'column',
  taste: 'cup',
  route: 'boot',
  museum: 'frame',
  gift: 'gift',
  trip: 'train',
  slow: 'leaf',
  birthday: 'cake',
  finale: 'anchor',
};

export const TYPE_LABEL: Record<CellType, string> = {
  intro: 'Начало',
  history: 'История',
  taste: 'Вкус',
  route: 'Маршрут',
  museum: 'Музей',
  gift: 'Подарок',
  trip: 'Выезд',
  slow: 'Медленный день',
  birthday: 'День рождения',
  finale: 'Финал',
};

export function TypeIcon({ type, className, withTitle }: { type: CellType; className?: string; withTitle?: boolean }) {
  return <Icon name={TYPE_ICON[type]} className={className} title={withTitle ? TYPE_LABEL[type] : undefined} />;
}
