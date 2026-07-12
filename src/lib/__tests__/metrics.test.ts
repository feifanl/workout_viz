import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseCsv, type Workout } from '../parse';
import {
  workoutDuration,
  setDurationByExercise,
  hasDurationData,
  volumePerWorkout,
  volumePerExercise,
  setsTotal,
  setsPerExercise,
  bestWeightPerExercise,
  workoutFrequency,
  muscleDistribution,
  favoriteExercises,
  neglectedMuscles,
  consistencyHeatmap,
  exerciseList,
  summaryStats,
} from '../metrics';

const fixture = readFileSync(
  fileURLToPath(new URL('./fixture.csv', import.meta.url)),
  'utf-8',
);
const { workouts } = parseCsv(fixture);

const sum = (arr: { value: number }[]) => arr.reduce((a, p) => a + p.value, 0);
const findByLabel = (arr: { label: string; value: number | null }[], label: string) =>
  arr.find((p) => p.label === label);

describe('time-series metrics (weekly buckets)', () => {
  it('volume per workout sums to total, split across two active weeks', () => {
    const s = volumePerWorkout(workouts, 'week');
    expect(sum(s)).toBe(6215);
    expect(s.some((p) => p.value === 3675)).toBe(true); // Push+Pull week
    expect(s.some((p) => p.value === 2540)).toBe(true); // Leg+Cardio week
  });

  it('total sets sums to 17 working sets', () => {
    expect(sum(setsTotal(workouts, 'week'))).toBe(17);
  });

  it('workout frequency sums to 4', () => {
    expect(sum(workoutFrequency(workouts, 'week'))).toBe(4);
  });

  it('average workout duration per week', () => {
    const s = workoutDuration(workouts, 'week');
    expect(findByLabel(s, 'May 12')?.value).toBe(55); // (60+50)/2
    expect(findByLabel(s, 'Jun 30')?.value).toBe(47.5); // (65+30)/2
  });

  it('volume per exercise isolates Squat', () => {
    expect(sum(volumePerExercise(workouts, 'Squat (Barbell)', 'week'))).toBe(1260);
  });

  it('sets per exercise isolates Bench', () => {
    expect(sum(setsPerExercise(workouts, 'Bench Press (Barbell)', 'week'))).toBe(3);
  });

  it('best weight per exercise ignores warmups, nulls empty buckets', () => {
    const s = bestWeightPerExercise(workouts, 'Deadlift (Barbell)', 'week');
    expect(findByLabel(s, 'May 12')?.value).toBe(100);
    expect(findByLabel(s, 'Jun 30')?.value).toBeNull();
  });
});

describe('duration metrics', () => {
  it('detects duration-based data', () => {
    expect(hasDurationData(workouts)).toBe(true);
  });

  it('sums plank minutes per week', () => {
    const s = setDurationByExercise(workouts, 'Plank', 'week');
    expect(findByLabel(s, 'May 12')?.value).toBe(1); // 60s
    expect(findByLabel(s, 'Jun 30')?.value).toBe(1.5); // 90s
  });
});

describe('distribution / ranking metrics', () => {
  it('muscle distribution counts working sets, sorted descending', () => {
    const d = muscleDistribution(workouts);
    expect(d[0]).toEqual({ name: 'Back', value: 4 });
    expect(sum(d)).toBe(17);
    expect(d.find((m) => m.name === 'Cardio')?.value).toBe(1);
  });

  it('favorite exercises lists all 8, top count 3', () => {
    const f = favoriteExercises(workouts);
    expect(f).toHaveLength(8);
    expect(f[0].value).toBe(3);
  });

  it('exercise list is most-performed first', () => {
    const list = exerciseList(workouts);
    expect(list).toHaveLength(8);
    expect(['Bench Press (Barbell)', 'Squat (Barbell)']).toContain(list[0]);
  });
});

describe('neglected muscles', () => {
  const now = new Date(2025, 6, 20); // 20 Jul 2025

  it('reports days since last trained, descending, only trained groups', () => {
    const n = neglectedMuscles(workouts, now);
    expect(n).toHaveLength(7);
    expect(n[0].daysSince).toBe(69); // Shoulders/Chest, last 12 May
    expect(n.find((m) => m.group === 'Biceps')).toBeUndefined();
    expect(n.find((m) => m.group === 'Core')?.daysSince).toBe(15); // last 5 Jul
  });
});

describe('consistency heatmap', () => {
  const now = new Date(2025, 6, 20);

  it('counts one workout per active day inside the trailing window', () => {
    const h = consistencyHeatmap(workouts, 'All', now);
    expect(h.total).toBe(4);
    expect(h.days.filter((d) => d.count > 0)).toHaveLength(4);
    expect(h.weeks).toBe(Math.ceil(h.days.length / 7));
  });
});

describe('summary stats', () => {
  it('aggregates totals over the range', () => {
    const s = summaryStats(workouts, workouts, new Date(2025, 6, 5));
    expect(s.totalWorkouts).toBe(4);
    expect(s.totalVolumeKg).toBe(6215);
    expect(s.totalSets).toBe(17);
  });

  it('weekly streak counts consecutive weeks back from now', () => {
    // current week (30 Jun) has workouts, prior week does not → streak 1
    expect(summaryStats(workouts, workouts, new Date(2025, 6, 5)).weeklyStreak).toBe(1);
  });

  it('weekly streak spans consecutive weeks and stops at a gap', () => {
    const mk = (start: Date): Workout => ({
      title: 'W',
      start,
      end: start,
      sets: [
        {
          exercise: 'Bench Press (Barbell)',
          setType: 'normal',
          weightKg: 50,
          weightLbs: null,
          reps: 5,
          distanceKm: null,
          distanceMiles: null,
          durationSeconds: null,
        },
      ],
    });
    const now = new Date(2025, 6, 20);
    const three = [
      mk(new Date(2025, 6, 16)), // this week
      mk(new Date(2025, 6, 9)), // -1 week
      mk(new Date(2025, 6, 2)), // -2 weeks
      mk(new Date(2025, 5, 4)), // gap
    ];
    expect(summaryStats(three, three, now).weeklyStreak).toBe(3);
  });
});
