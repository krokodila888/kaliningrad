import { useSyncExternalStore } from 'react';
import type { IsoDate } from '../types';

export type Route =
  | { name: 'home' }
  | { name: 'day'; date: IsoDate }
  | { name: 'all' }
  | { name: 'homlins' };

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#/, '');
  const m = /^day-(\d{4}-\d{2}-\d{2})$/.exec(h);
  if (m) return { name: 'day', date: m[1] };
  if (h === 'all') return { name: 'all' };
  if (h === 'homlins') return { name: 'homlins' };
  return { name: 'home' };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'day':
      return `#day-${route.date}`;
    case 'all':
      return '#all';
    case 'homlins':
      return '#homlins';
    default:
      return '';
  }
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  window.addEventListener('popstate', cb);
  return () => {
    window.removeEventListener('hashchange', cb);
    window.removeEventListener('popstate', cb);
  };
};

export function useHash(): string {
  return useSyncExternalStore(subscribe, () => window.location.hash, () => '');
}

export function navigate(route: Route) {
  const hash = routeToHash(route);
  if (hash === window.location.hash) return;
  if (hash) {
    window.location.hash = hash;
  } else {
    history.pushState(null, '', window.location.pathname + window.location.search);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}
