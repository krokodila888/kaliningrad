import { useSyncExternalStore } from 'react';
import type { IsoDate, Progress } from '../types';
import { createSafeStorage, type SafeStorage } from './storage';

const KEY = 'kaliningrad-advent:progress:v1';

export function emptyProgress(): Progress {
  return { version: 1, seen: {}, unwrapped: {}, tasksDone: {} };
}

export function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress();
  try {
    const p = JSON.parse(raw) as Partial<Progress>;
    if (p?.version !== 1) return emptyProgress();
    const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, never>) : {});
    return {
      version: 1,
      seen: obj(p.seen),
      unwrapped: obj(p.unwrapped),
      tasksDone: obj(p.tasksDone),
    };
  } catch {
    return emptyProgress();
  }
}

export function createProgressStore(storage: SafeStorage) {
  let state = parseProgress(storage.get(KEY));
  const listeners = new Set<() => void>();

  const update = (fn: (p: Progress) => Progress) => {
    state = fn(state);
    storage.set(KEY, JSON.stringify(state));
    listeners.forEach((l) => l());
  };

  const toggle = <K extends string>(rec: Partial<Record<K, true>>, key: K, on: boolean) => {
    const next = { ...rec };
    if (on) next[key] = true;
    else delete next[key];
    return next;
  };

  return {
    get: () => state,
    subscribe(l: () => void) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    markSeen(date: IsoDate) {
      if (state.seen[date]) return;
      update((p) => ({ ...p, seen: { ...p.seen, [date]: new Date().toISOString() } }));
    },
    markUnwrapped(date: IsoDate) {
      if (state.unwrapped[date]) return;
      update((p) => ({ ...p, unwrapped: { ...p.unwrapped, [date]: true } }));
    },
    setTaskDone(date: IsoDate, done: boolean) {
      update((p) => ({ ...p, tasksDone: toggle(p.tasksDone, date, done) as Progress['tasksDone'] }));
    },
  };
}

export const progressStore = createProgressStore(createSafeStorage());

export function useProgress(): Progress {
  return useSyncExternalStore(progressStore.subscribe, progressStore.get, progressStore.get);
}
