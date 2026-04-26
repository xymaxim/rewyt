import type { OklchRange, Range } from "./types";

export function randBetween([min, max]: Range): number {
  return min + Math.random() * (max - min);
}

export function randFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomOklch(range: OklchRange): string {
  const l = randBetween(range.l);
  const c = randBetween(range.c);
  const h = randBetween(range.h);
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}

export const OKLCH_RANGE: OklchRange = {
  l: [0.8, 0.9],
  c: [0.05, 0.15],
  h: [0, 360],
};
