import { useEffect, useState } from 'react';
import * as raw from 'virtual:advent-data';
import type { Cell, IsoDate, SealedCell } from '../types';
import { openCell } from './crypto';

const sealedCells = raw.sealedCells as SealedCell[];

const byDate = new Map<IsoDate, SealedCell>(sealedCells.map((c) => [c.date, c]));
const cache = new Map<IsoDate, Promise<Cell | null>>();

export function sealedFor(date: IsoDate): SealedCell | undefined {
  return byDate.get(date);
}

export function loadCell(date: IsoDate): Promise<Cell | null> {
  let p = cache.get(date);
  if (!p) {
    const sealed = byDate.get(date);
    p = sealed ? openCell(sealed).catch(() => null) : Promise.resolve(null);
    cache.set(date, p);
  }
  return p;
}

export type CellState = { status: 'loading' } | { status: 'ready'; cell: Cell } | { status: 'empty' };

export function useCell(date: IsoDate): CellState {
  const [state, setState] = useState<{ date: IsoDate; value: CellState }>({ date, value: { status: 'loading' } });
  useEffect(() => {
    let alive = true;
    loadCell(date).then((cell) => {
      if (alive) setState({ date, value: cell ? { status: 'ready', cell } : { status: 'empty' } });
    });
    return () => {
      alive = false;
    };
  }, [date]);
  return state.date === date ? state.value : { status: 'loading' };
}

export function useCells(dates: IsoDate[]): Map<IsoDate, Cell> {
  const key = dates.join(',');
  const [cells, setCells] = useState(new Map<IsoDate, Cell>());
  useEffect(() => {
    let alive = true;
    Promise.all(key ? key.split(',').map((d) => loadCell(d).then((c) => [d, c] as const)) : []).then((pairs) => {
      if (!alive) return;
      setCells(new Map(pairs.filter((p): p is readonly [IsoDate, Cell] => p[1] !== null)));
    });
    return () => {
      alive = false;
    };
  }, [key]);
  return cells;
}
