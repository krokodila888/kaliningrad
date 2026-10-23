export type IsoDate = string; // '2026-11-01'

export type CellType =
  | 'intro'
  | 'history'
  | 'taste'
  | 'route'
  | 'museum'
  | 'gift'
  | 'trip'
  | 'slow'
  | 'birthday'
  | 'finale';

export type HomlinId = 'karl' | 'marta' | 'varvara' | 'leo' | 'vitek' | 'ulya' | 'antoshka';

export interface Practical {
  address?: string;
  hours?: string;
  price?: string;
  /** «7 минут пешком» */
  distanceFromHome?: string;
  /** Ссылка на Яндекс Карты */
  mapUrl?: string;
}

export interface CityEvent {
  /** 'HH:MM' по Калининграду; без времени — событие на весь день */
  time?: string;
  title: string;
  place: string;
  price?: string;
  link?: string;
}

export interface Task {
  /** markdown: загадка или задание */
  text: string;
  /** Показывается после «Нашла!» */
  answer?: string;
}

export interface Gift {
  title: string;
  /** markdown */
  description: string;
  link?: string;
  code?: string;
}

export interface CellImage {
  /** Путь относительно public/img */
  src: string;
  alt: string;
}

export interface Cell {
  /** 1..32 */
  day: number;
  date: IsoDate;
  type: CellType;
  title: string;
  /** markdown, 3–6 предложений */
  story: string;
  practical: Practical;
  task?: Task;
  gift?: Gift;
  homlin?: HomlinId;
  image?: CellImage;
  events?: CityEvent[];
}

export interface Homlin {
  id: HomlinId;
  name: string;
  riddle: string;
  place: string;
  revealText: string;
}

/** То, что попадает в сборку: дата и тип открыты, остальное зашифровано. */
export interface SealedCell {
  day: number;
  date: IsoDate;
  type: CellType;
  iv: string;
  data: string;
}

export interface Progress {
  version: 1;
  /** Когда ячейка впервые открыта */
  seen: Record<IsoDate, string>;
  /** Подарок уже распакован — дальше без анимации */
  unwrapped: Record<IsoDate, true>;
  /** Отметки «Нашла!» / «Сделала!» */
  tasksDone: Record<IsoDate, true>;
  homlinsFound: Partial<Record<HomlinId, true>>;
}
