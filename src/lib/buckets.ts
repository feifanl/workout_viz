import type { Workout } from './parse';

export type RangeKey = '1W' | '1M' | '3M' | '6M' | '1Y' | 'All';
export const RANGES: RangeKey[] = ['1W', '1M', '3M', '6M', '1Y', 'All'];
export const DEFAULT_RANGE: RangeKey = '3M';

export type BucketType = 'day' | 'week' | 'month';

export interface BucketDef {
  key: string;
  label: string;
  start: Date;
}

const MMM = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Monday 00:00 of the week containing d. */
function mondayOf(d: Date): Date {
  const s = startOfDay(d);
  const shift = (s.getDay() + 6) % 7; // Mon=0 … Sun=6
  s.setDate(s.getDate() - shift);
  return s;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function bucketStart(date: Date, type: BucketType): Date {
  if (type === 'day') return startOfDay(date);
  if (type === 'week') return mondayOf(date);
  return startOfMonth(date);
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function keyOf(start: Date, type: BucketType): string {
  const stem = `${start.getFullYear()}-${pad(start.getMonth() + 1)}`;
  return type === 'month' ? stem : `${stem}-${pad(start.getDate())}`;
}

function labelOf(start: Date, type: BucketType): string {
  if (type === 'month') return `${MMM[start.getMonth()]} '${pad(start.getFullYear() % 100)}`;
  return `${MMM[start.getMonth()]} ${start.getDate()}`;
}

export function assignBucketKey(date: Date, type: BucketType): string {
  return keyOf(bucketStart(date, type), type);
}

function step(start: Date, type: BucketType): Date {
  const d = new Date(start);
  if (type === 'day') d.setDate(d.getDate() + 1);
  else if (type === 'week') d.setDate(d.getDate() + 7);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

export function enumerateBuckets(from: Date, to: Date, type: BucketType): BucketDef[] {
  const out: BucketDef[] = [];
  let cur = bucketStart(from, type);
  const endMs = bucketStart(to, type).getTime();
  while (cur.getTime() <= endMs) {
    out.push({ key: keyOf(cur, type), label: labelOf(cur, type), start: cur });
    cur = step(cur, type);
  }
  return out;
}

/** Ordered buckets spanning the workouts' own min→max start (fills gaps). */
export function buildBuckets(workouts: Workout[], type: BucketType): BucketDef[] {
  if (workouts.length === 0) return [];
  let min = workouts[0].start;
  let max = workouts[0].start;
  for (const w of workouts) {
    if (w.start < min) min = w.start;
    if (w.start > max) max = w.start;
  }
  return enumerateBuckets(min, max, type);
}

export function filterByRange(
  workouts: Workout[],
  range: RangeKey,
  now: Date = new Date(),
): Workout[] {
  if (range === 'All') return workouts;
  const cutoff = new Date(now);
  switch (range) {
    case '1W': cutoff.setDate(cutoff.getDate() - 7); break;
    case '1M': cutoff.setMonth(cutoff.getMonth() - 1); break;
    case '3M': cutoff.setMonth(cutoff.getMonth() - 3); break;
    case '6M': cutoff.setMonth(cutoff.getMonth() - 6); break;
    case '1Y': cutoff.setFullYear(cutoff.getFullYear() - 1); break;
  }
  const t = cutoff.getTime();
  return workouts.filter((w) => w.start.getTime() >= t);
}

export function bucketTypeForRange(range: RangeKey, workouts: Workout[]): BucketType {
  if (range === '1W' || range === '1M') return 'day';
  if (range !== 'All') return 'week';
  if (workouts.length === 0) return 'week';
  const span =
    workouts[workouts.length - 1].start.getTime() - workouts[0].start.getTime();
  return span <= TWO_YEARS_MS ? 'week' : 'month';
}
