import type { Workout, WorkoutSet } from './parse';
import {
  assignBucketKey,
  bucketStart,
  buildBuckets,
  type BucketType,
  type RangeKey,
} from './buckets';
import { muscleFor, type MuscleGroup } from './muscles';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ---- shared shapes -------------------------------------------------------

/** Bar-chart point: empty buckets are 0. */
export interface TimePoint {
  key: string;
  label: string;
  value: number;
}

/** Line-chart point: empty buckets are null (connectNulls across gaps). */
export interface TimeLinePoint {
  key: string;
  label: string;
  value: number | null;
}

export interface NamedValue {
  name: string;
  value: number;
}

// ---- set-level helpers ---------------------------------------------------

/** Warmups are excluded from volume, best-weight and set-count metrics. */
export function isWorkingSet(s: WorkoutSet): boolean {
  return s.setType !== 'warmup';
}

function setVolume(s: WorkoutSet): number {
  if (!isWorkingSet(s) || s.weightKg === null || s.reps === null) return 0;
  return s.weightKg * s.reps;
}

function sumVolume(sets: WorkoutSet[]): number {
  return sets.reduce((acc, s) => acc + setVolume(s), 0);
}

function workingCount(sets: WorkoutSet[], exercise?: string): number {
  return sets.filter(
    (s) => isWorkingSet(s) && (exercise === undefined || s.exercise === exercise),
  ).length;
}

function maxWorkingWeight(sets: WorkoutSet[], exercise: string): number | null {
  let max: number | null = null;
  for (const s of sets) {
    if (!isWorkingSet(s) || s.exercise !== exercise || s.weightKg === null) continue;
    max = max === null ? s.weightKg : Math.max(max, s.weightKg);
  }
  return max;
}

// ---- bucketing combinators ----------------------------------------------

function seriesBars(
  workouts: Workout[],
  type: BucketType,
  perWorkout: (w: Workout) => number,
): TimePoint[] {
  const acc = new Map<string, number>();
  for (const w of workouts) {
    const k = assignBucketKey(w.start, type);
    acc.set(k, (acc.get(k) ?? 0) + perWorkout(w));
  }
  return buildBuckets(workouts, type).map((b) => ({
    key: b.key,
    label: b.label,
    value: acc.get(b.key) ?? 0,
  }));
}

function seriesAvgLine(
  workouts: Workout[],
  type: BucketType,
  perWorkout: (w: Workout) => number,
): TimeLinePoint[] {
  const sum = new Map<string, number>();
  const count = new Map<string, number>();
  for (const w of workouts) {
    const k = assignBucketKey(w.start, type);
    sum.set(k, (sum.get(k) ?? 0) + perWorkout(w));
    count.set(k, (count.get(k) ?? 0) + 1);
  }
  return buildBuckets(workouts, type).map((b) => {
    const c = count.get(b.key);
    return { key: b.key, label: b.label, value: c ? sum.get(b.key)! / c : null };
  });
}

function seriesMaxLine(
  workouts: Workout[],
  type: BucketType,
  perWorkout: (w: Workout) => number | null,
): TimeLinePoint[] {
  const max = new Map<string, number>();
  for (const w of workouts) {
    const v = perWorkout(w);
    if (v === null) continue;
    const k = assignBucketKey(w.start, type);
    const cur = max.get(k);
    max.set(k, cur === undefined ? v : Math.max(cur, v));
  }
  return buildBuckets(workouts, type).map((b) => ({
    key: b.key,
    label: b.label,
    value: max.has(b.key) ? max.get(b.key)! : null,
  }));
}

// ---- time-series metrics -------------------------------------------------

/** 1. Average workout duration (minutes) per bucket. */
export function workoutDuration(workouts: Workout[], type: BucketType): TimeLinePoint[] {
  return seriesAvgLine(
    workouts,
    type,
    (w) => (w.end.getTime() - w.start.getTime()) / 60000,
  );
}

/** 2. Total duration (minutes) of a duration-based exercise per bucket. */
export function setDurationByExercise(
  workouts: Workout[],
  exercise: string,
  type: BucketType,
): TimePoint[] {
  return seriesBars(workouts, type, (w) =>
    w.sets
      .filter((s) => isWorkingSet(s) && s.exercise === exercise && s.durationSeconds !== null)
      .reduce((acc, s) => acc + s.durationSeconds! / 60, 0),
  );
}

/** Whether any working set carries a duration (controls card visibility). */
export function hasDurationData(workouts: Workout[]): boolean {
  return workouts.some((w) =>
    w.sets.some((s) => isWorkingSet(s) && s.durationSeconds !== null),
  );
}

/** 3. Total volume per bucket. */
export function volumePerWorkout(workouts: Workout[], type: BucketType): TimePoint[] {
  return seriesBars(workouts, type, (w) => sumVolume(w.sets));
}

/** 4. Volume for one exercise per bucket. */
export function volumePerExercise(
  workouts: Workout[],
  exercise: string,
  type: BucketType,
): TimePoint[] {
  return seriesBars(workouts, type, (w) =>
    sumVolume(w.sets.filter((s) => s.exercise === exercise)),
  );
}

/** 5. Total working-set count per bucket. */
export function setsTotal(workouts: Workout[], type: BucketType): TimePoint[] {
  return seriesBars(workouts, type, (w) => workingCount(w.sets));
}

/** 6. Working-set count for one exercise per bucket. */
export function setsPerExercise(
  workouts: Workout[],
  exercise: string,
  type: BucketType,
): TimePoint[] {
  return seriesBars(workouts, type, (w) => workingCount(w.sets, exercise));
}

/** 7. Best (max) weight for one exercise per bucket. */
export function bestWeightPerExercise(
  workouts: Workout[],
  exercise: string,
  type: BucketType,
): TimeLinePoint[] {
  return seriesMaxLine(workouts, type, (w) => maxWorkingWeight(w.sets, exercise));
}

/** 8. Workout count per bucket. */
export function workoutFrequency(workouts: Workout[], type: BucketType): TimePoint[] {
  return seriesBars(workouts, type, () => 1);
}

// ---- distribution / ranking metrics --------------------------------------

/** 9. Working sets per muscle group, descending (zero groups omitted). */
export function muscleDistribution(workouts: Workout[]): NamedValue[] {
  const counts = new Map<MuscleGroup, number>();
  for (const w of workouts) {
    for (const s of w.sets) {
      if (!isWorkingSet(s)) continue;
      const g = muscleFor(s.exercise);
      counts.set(g, (counts.get(g) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/** 10. Top 10 exercises by working-set count. */
export function favoriteExercises(workouts: Workout[]): NamedValue[] {
  const counts = new Map<string, number>();
  for (const w of workouts) {
    for (const s of w.sets) {
      if (!isWorkingSet(s)) continue;
      counts.set(s.exercise, (counts.get(s.exercise) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

export interface NeglectedMuscle {
  group: MuscleGroup;
  lastTrained: Date;
  daysSince: number;
}

/**
 * 12. For every muscle group ever trained in the FULL dataset: days since last
 * trained, descending. Never-trained groups omitted. Not range-filtered.
 */
export function neglectedMuscles(
  allWorkouts: Workout[],
  now: Date = new Date(),
): NeglectedMuscle[] {
  const last = new Map<MuscleGroup, Date>();
  for (const w of allWorkouts) {
    for (const s of w.sets) {
      if (!isWorkingSet(s)) continue;
      const g = muscleFor(s.exercise);
      const prev = last.get(g);
      if (!prev || w.start > prev) last.set(g, w.start);
    }
  }
  const today = bucketStart(now, 'day').getTime();
  return [...last.entries()]
    .map(([group, lastTrained]) => ({
      group,
      lastTrained,
      daysSince: Math.floor((today - bucketStart(lastTrained, 'day').getTime()) / MS_PER_DAY),
    }))
    .sort((a, b) => b.daysSince - a.daysSince);
}

// ---- heatmap -------------------------------------------------------------

export interface HeatDay {
  date: Date;
  count: number;
}

export interface HeatmapData {
  days: HeatDay[];
  total: number;
  weeks: number;
}

function heatmapStart(allWorkouts: Workout[], range: RangeKey, end: Date): Date {
  if (range === 'All') {
    let min = Infinity;
    for (const w of allWorkouts) {
      min = Math.min(min, bucketStart(w.start, 'day').getTime());
    }
    const raw = Number.isFinite(min) ? new Date(min) : new Date(end.getTime() - 364 * MS_PER_DAY);
    return bucketStart(raw, 'week');
  }
  const raw = new Date(end);
  switch (range) {
    case '1W': raw.setDate(raw.getDate() - 6); break;
    case '1M': raw.setMonth(raw.getMonth() - 1); break;
    case '3M': raw.setMonth(raw.getMonth() - 3); break;
    case '6M': raw.setMonth(raw.getMonth() - 6); break;
    case '1Y': raw.setFullYear(raw.getFullYear() - 1); break;
  }
  return bucketStart(raw, 'week'); // Monday align → whole weeks
}

/** 13. Per-day workout counts over the selected range, Monday-aligned grid. */
export function consistencyHeatmap(
  allWorkouts: Workout[],
  range: RangeKey = '1Y',
  now: Date = new Date(),
): HeatmapData {
  const end = bucketStart(now, 'day');
  const start = heatmapStart(allWorkouts, range, end);
  const startMs = start.getTime();
  const endMs = end.getTime();

  const counts = new Map<string, number>();
  for (const w of allWorkouts) {
    const ms = bucketStart(w.start, 'day').getTime();
    if (ms < startMs || ms > endMs) continue;
    const k = assignBucketKey(w.start, 'day');
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  const days: HeatDay[] = [];
  let total = 0;
  for (const d = new Date(start); d.getTime() <= endMs; d.setDate(d.getDate() + 1)) {
    const c = counts.get(assignBucketKey(d, 'day')) ?? 0;
    total += c;
    days.push({ date: new Date(d), count: c });
  }
  return { days, total, weeks: Math.ceil(days.length / 7) };
}

// ---- exercise list + summary --------------------------------------------

/** Unique exercises, most-performed (by working sets) first. */
export function exerciseList(workouts: Workout[]): string[] {
  const counts = new Map<string, number>();
  for (const w of workouts) {
    for (const s of w.sets) {
      if (!isWorkingSet(s)) continue;
      counts.set(s.exercise, (counts.get(s.exercise) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
}

export interface Summary {
  totalWorkouts: number;
  totalVolumeKg: number;
  totalSets: number;
  weeklyStreak: number;
}

function weeklyStreak(allWorkouts: Workout[], now: Date): number {
  const weeks = new Set(allWorkouts.map((w) => assignBucketKey(w.start, 'week')));
  const cursor = bucketStart(now, 'week');
  // grace: an empty current week doesn't break a streak earned in prior weeks
  if (!weeks.has(assignBucketKey(cursor, 'week'))) {
    cursor.setDate(cursor.getDate() - 7);
  }
  let streak = 0;
  while (weeks.has(assignBucketKey(cursor, 'week'))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

export function summaryStats(
  rangeWorkouts: Workout[],
  allWorkouts: Workout[],
  now: Date = new Date(),
): Summary {
  let totalVolumeKg = 0;
  let totalSets = 0;
  for (const w of rangeWorkouts) {
    for (const s of w.sets) {
      if (!isWorkingSet(s)) continue;
      totalSets++;
      totalVolumeKg += setVolume(s);
    }
  }
  return {
    totalWorkouts: rangeWorkouts.length,
    totalVolumeKg,
    totalSets,
    weeklyStreak: weeklyStreak(allWorkouts, now),
  };
}
