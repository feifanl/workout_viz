import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseCsv, parseHevyDate } from '../parse';

const fixture = readFileSync(
  fileURLToPath(new URL('./fixture.csv', import.meta.url)),
  'utf-8',
);

describe('parseHevyDate', () => {
  it('parses "D MMM YYYY, HH:mm"', () => {
    const d = parseHevyDate('12 Jul 2025, 14:30')!;
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(6); // July
    expect(d.getDate()).toBe(12);
    expect(d.getHours()).toBe(14);
    expect(d.getMinutes()).toBe(30);
  });

  it('accepts optional seconds', () => {
    const d = parseHevyDate('1 Jan 2024, 08:05:09')!;
    expect(d.getSeconds()).toBe(9);
  });

  it('falls back to native Date for ISO strings', () => {
    const d = parseHevyDate('2025-07-05T07:00:00')!;
    expect(d.getFullYear()).toBe(2025);
  });

  it('returns null for garbage or empty', () => {
    expect(parseHevyDate('garbage-date')).toBeNull();
    expect(parseHevyDate('')).toBeNull();
    expect(parseHevyDate(undefined)).toBeNull();
  });
});

describe('parseCsv (fixture)', () => {
  const result = parseCsv(fixture);

  it('groups rows into 4 workouts, sorted ascending', () => {
    expect(result.errors).toEqual([]);
    expect(result.workouts.map((w) => w.title)).toEqual([
      'Push Day',
      'Pull Day',
      'Leg Day',
      'Cardio',
    ]);
  });

  it('skips the unparseable-date row and counts it', () => {
    expect(result.skippedRows).toBe(1);
  });

  it('keeps warmup sets in the sets array', () => {
    const push = result.workouts[0];
    expect(push.sets).toHaveLength(7);
    const warmup = push.sets.find((s) => s.setType === 'warmup')!;
    expect(warmup.weightKg).toBe(40);
    expect(warmup.reps).toBe(10);
  });

  it('treats empty numeric fields as null (duration-only set)', () => {
    const push = result.workouts[0];
    const plank = push.sets.find((s) => s.exercise === 'Plank')!;
    expect(plank.weightKg).toBeNull();
    expect(plank.reps).toBeNull();
    expect(plank.durationSeconds).toBe(60);
  });

  it('captures distance for cardio sets', () => {
    const cardio = result.workouts[3];
    const run = cardio.sets.find((s) => s.exercise === 'Running')!;
    expect(run.distanceKm).toBe(5);
    expect(run.durationSeconds).toBe(1800);
  });

  it('derives workout end time', () => {
    const push = result.workouts[0];
    expect(push.end.getTime() - push.start.getTime()).toBe(60 * 60 * 1000);
  });
});

describe('parseCsv (edge cases)', () => {
  it('reports missing required columns', () => {
    const r = parseCsv('a,b,c\n1,2,3');
    expect(r.workouts).toHaveLength(0);
    expect(r.errors[0]).toMatch(/Missing required columns/);
  });

  it('errors when zero workouts parse', () => {
    const header =
      'title,start_time,exercise_title,set_type,weight_kg,reps';
    expect(parseCsv(header).errors).toHaveLength(1);
  });

  it('converts weight_lbs to canonical kg', () => {
    const csv =
      'title,start_time,end_time,exercise_title,set_type,weight_lbs,reps\n' +
      'A,"1 Jan 2025, 10:00","1 Jan 2025, 11:00",Bench Press (Barbell),normal,100,5';
    const set = parseCsv(csv).workouts[0].sets[0];
    expect(set.weightLbs).toBe(100);
    expect(set.weightKg).toBeCloseTo(45.359, 2);
  });
});
