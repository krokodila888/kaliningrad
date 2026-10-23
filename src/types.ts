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

export interface ImageCredit {
  /** Автор, если известен */
  author?: string;
  /** «CC BY-SA 4.0», «Общественное достояние» … */
  license: string;
  /** Страница файла в источнике (например, Wikimedia Commons) */
  url: string;
}

export interface CellImage {
  /** Путь относительно public/img */
  src: string;
  /** Описание для незрячих */
  alt: string;
  /** Подпись под картинкой */
  caption?: string;
  credit?: ImageCredit;
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
  /** Первая — крупно, остальные — галереей */
  images?: CellImage[];
  events?: CityEvent[];
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
  /** Отметки «Сделала!» */
  tasksDone: Record<IsoDate, true>;
}
