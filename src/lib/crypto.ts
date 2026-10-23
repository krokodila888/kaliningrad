// Работает и в Node (при сборке), и в браузере: оба дают WebCrypto через globalThis.crypto.
import type { Cell, IsoDate, SealedCell } from '../types';
import { CELL_SALT } from '../config';

const enc = new TextEncoder();
const dec = new TextDecoder();

function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

export async function sha256Hex(text: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function keyFor(date: IsoDate, salt: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest('SHA-256', enc.encode(`${salt}:${date}`));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function sealCell(cell: Cell, salt = CELL_SALT): Promise<SealedCell> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await keyFor(cell.date, salt);
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(cell)));
  return { day: cell.day, date: cell.date, type: cell.type, iv: toBase64(iv), data: toBase64(new Uint8Array(data)) };
}

export async function openCell(sealed: SealedCell, salt = CELL_SALT): Promise<Cell> {
  const key = await keyFor(sealed.date, salt);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(sealed.iv) }, key, fromBase64(sealed.data));
  return JSON.parse(dec.decode(plain)) as Cell;
}
