import { useMemo, useState } from 'react';
import type { Workout } from '../lib/parse';
import type { Unit } from '../lib/units';
import { formatVolume, formatWeight } from '../lib/units';
import { DEFAULT_RANGE, filterByRange, type RangeKey } from '../lib/buckets';
import * as M from '../lib/metrics';
import ChartCard from './ChartCard';
import StatTile from './StatTile';
import RangeSelector from './RangeSelector';
import Heatmap from './Heatmap';
import ExerciseSelect from './ExerciseSelect';
import ZoomableChart from './charts/ZoomableChart';
import HBar from './charts/HBar';

interface Props {
  workouts: Workout[];
  unit: Unit;
  onReset: () => void;
  skippedRows: number;
}

const fmtInt = (v: number) => `${Math.round(v)}`;
const fmtMin = (v: number) => `${v.toFixed(0)} min`;

export default function Dashboard({ workouts, unit, onReset, skippedRows }: Props) {
  const [range, setRange] = useState<RangeKey>(DEFAULT_RANGE);
  const exercises = useMemo(() => M.exerciseList(workouts), [workouts]);
  const [exercise, setExercise] = useState(exercises[0] ?? '');

  const filtered = useMemo(() => filterByRange(workouts, range), [workouts, range]);

  const fmtVol = (v: number) => formatVolume(v, unit);
  const fmtWt = (v: number) => formatWeight(v, unit);

  const summary = M.summaryStats(filtered, workouts);
  const heatmap = M.consistencyHeatmap(workouts);
  const neglected = M.neglectedMuscles(workouts);
  const showDuration = M.hasDurationData(filtered);
  const empty = filtered.length === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <div className="flex justify-end">
        <button
          onClick={onReset}
          className="rounded-md border border-border px-4 py-2 text-sm text-muted transition hover:border-accent/50 hover:text-text"
        >
          Upload a different file
        </button>
      </div>
      {skippedRows > 0 && (
        <p className="text-xs text-muted">{skippedRows} unparseable row(s) were skipped.</p>
      )}

      <section className="fade-up grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Workouts" value={fmtInt(summary.totalWorkouts)} />
        <StatTile label="Volume" value={fmtVol(summary.totalVolumeKg)} />
        <StatTile label="Working sets" value={fmtInt(summary.totalSets)} />
        <StatTile label="Weekly streak" value={`${summary.weeklyStreak} wk`} />
      </section>

      <RangeSelector value={range} onChange={setRange} />

      <ChartCard title="Consistency">
        <Heatmap data={heatmap} />
      </ChartCard>

      {empty ? (
        <p className="rounded-lg border border-border bg-panel p-8 text-center text-muted">
          No workouts in this range.
        </p>
      ) : (
        <>
          <section className="space-y-4">
            <ZoomableChart title="Workout frequency" variant="bar" workouts={filtered} compute={M.workoutFrequency} format={fmtInt} />
            <ZoomableChart title="Avg workout duration" variant="line" workouts={filtered} compute={M.workoutDuration} format={fmtMin} />
            <ZoomableChart title="Total volume" variant="bar" workouts={filtered} compute={M.volumePerWorkout} format={fmtVol} />
            <ZoomableChart title="Total working sets" variant="bar" workouts={filtered} compute={M.setsTotal} format={fmtInt} />
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Per exercise
              </h2>
              <ExerciseSelect options={exercises} value={exercise} onChange={setExercise} />
            </div>
            <div className="space-y-4">
              <ZoomableChart title="Volume" variant="bar" workouts={filtered} compute={(ws, t) => M.volumePerExercise(ws, exercise, t)} format={fmtVol} />
              <ZoomableChart title="Working sets" variant="bar" workouts={filtered} compute={(ws, t) => M.setsPerExercise(ws, exercise, t)} format={fmtInt} />
              <ZoomableChart title="Best weight" variant="line" workouts={filtered} compute={(ws, t) => M.bestWeightPerExercise(ws, exercise, t)} format={fmtWt} />
              {showDuration && (
                <ZoomableChart title="Set duration" variant="bar" workouts={filtered} compute={(ws, t) => M.setDurationByExercise(ws, exercise, t)} format={fmtMin} />
              )}
            </div>
          </section>

          <section className="space-y-4">
            <ChartCard title="Muscle group distribution">
              <HBar data={M.muscleDistribution(filtered)} format={fmtInt} />
            </ChartCard>
            <ChartCard title="Favorite exercises">
              <HBar data={M.favoriteExercises(filtered)} format={fmtInt} />
            </ChartCard>
            <ChartCard title="Neglected muscles">
              <div className="space-y-1">
                {neglected.map((n) => (
                  <div
                    key={n.group}
                    className={`flex justify-between rounded px-2 py-1 text-sm ${
                      n.daysSince >= 14 ? 'bg-red-500/10 text-red-300' : 'text-text'
                    }`}
                  >
                    <span>{n.group}</span>
                    <span className="text-muted">{n.daysSince}d ago</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </section>
        </>
      )}

    </div>
  );
}
