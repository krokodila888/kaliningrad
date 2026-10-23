import { useEffect, useState } from 'react';
import { PREVIEW_SECRET_HASH } from '../config';
import { sha256Hex } from './crypto';

/** Режим автора включается параметром ?preview=СЕКРЕТ. В коде лежит только хэш секрета. */
export function usePreviewMode(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const secret = new URLSearchParams(window.location.search).get('preview');
    if (!secret) return;
    let alive = true;
    sha256Hex(secret)
      .then((h) => alive && setEnabled(h === PREVIEW_SECRET_HASH))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  return enabled;
}
