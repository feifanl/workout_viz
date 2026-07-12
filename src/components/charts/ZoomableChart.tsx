import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Workout } from '../../lib/parse';
import {
  DEFAULT_RANGE,
  filterByRange,
  type BucketType,
  type RangeKey,
} from '../../lib/buckets';
import type { TimeLinePoint, TimePoint } from '../../lib/metrics';
import ChartCard from '../ChartCard';
import RangeSelector from '../RangeSelector';
import TimeBar from './TimeBar';
import TimeLine from './TimeLine';

const DAY = 86_400_000;
const MIN_SPAN = 2 * DAY;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Finer buckets as the visible window shrinks.
function pickGranularity(spanDays: number): BucketType {
  if (spanDays > 540) return 'month';
  if (spanDays > 70) return 'week';
  return 'day';
}

const GRAN_LABEL: Record<BucketType, string> = {
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
};

type Props =
  | {
      title: string;
      variant: 'bar';
      workouts: Workout[];
      compute: (ws: Workout[], t: BucketType) => TimePoint[];
      format?: (v: number) => string;
      height?: number;
    }
  | {
      title: string;
      variant: 'line';
      workouts: Workout[];
      compute: (ws: Workout[], t: BucketType) => TimeLinePoint[];
      format?: (v: number) => string;
      height?: number;
    };

function MagnifierIcon({ plus }: { plus: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    >
      <circle cx="6" cy="6" r="4.3" />
      <line x1="9.4" y1="9.4" x2="13" y2="13" />
      <line x1="4" y1="6" x2="8" y2="6" />
      {plus && <line x1="6" y1="4" x2="6" y2="8" />}
    </svg>
  );
}

export default function ZoomableChart(props: Props) {
  const { title, workouts, height = 320 } = props;
  const [range, setRange] = useState<RangeKey>(DEFAULT_RANGE);

  const ranged = useMemo(() => filterByRange(workouts, range), [workouts, range]);

  const { tMin, tMax } = useMemo(() => {
    let a = Infinity;
    let b = -Infinity;
    for (const w of ranged) {
      const t = w.start.getTime();
      if (t < a) a = t;
      if (t > b) b = t;
    }
    return Number.isFinite(a) ? { tMin: a, tMax: b } : { tMin: 0, tMax: 0 };
  }, [ranged]);

  const [win, setWin] = useState<[number, number]>([tMin, tMax]);
  const boxRef = useRef<HTMLDivElement>(null);

  // reset the window whenever the underlying domain changes (range change)
  useEffect(() => {
    setWin([tMin, tMax]);
  }, [tMin, tMax]);

  const t0 = Math.max(win[0], tMin);
  const t1 = Math.min(win[1], tMax);
  const fullSpan = tMax - tMin;
  const spanDays = Math.max((t1 - t0) / DAY, 0) + 1;
  const gran = pickGranularity(spanDays);
  const zoomed = t1 - t0 < fullSpan - 1000;

  const applyZoom = useCallback(
    (factor: number, frac: number) => {
      setWin(([a, b]) => {
        const A = Math.max(a, tMin);
        const B = Math.min(b, tMax);
        const span = B - A;
        const full = tMax - tMin;
        if (full <= 0) return [tMin, tMax];
        const ns = clamp(span * factor, Math.min(MIN_SPAN, full), full);
        const pivot = A + frac * span;
        let na = pivot - frac * ns;
        let nb = na + ns;
        if (na < tMin) {
          na = tMin;
          nb = tMin + ns;
        }
        if (nb > tMax) {
          nb = tMax;
          na = tMax - ns;
        }
        return [na, nb];
      });
    },
    [tMin, tMax],
  );

  // native non-passive wheel listener so preventDefault works (page won't scroll)
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const frac = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      applyZoom(e.deltaY < 0 ? 0.7 : 1.4, frac);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [applyZoom]);

  const windowWorkouts = useMemo(
    () => ranged.filter((w) => w.start.getTime() >= t0 && w.start.getTime() <= t1),
    [ranged, t0, t1],
  );

  const btn =
    'rounded border border-border p-1 text-muted transition hover:text-text disabled:cursor-default disabled:opacity-30';
  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      <RangeSelector value={range} onChange={setRange} />
      <div className="flex gap-1">
        <button className={btn} title="Zoom out" disabled={!zoomed} onClick={() => applyZoom(1.8, 0.5)}>
          <MagnifierIcon plus={false} />
        </button>
        <button
          className={btn}
          title="Zoom in"
          disabled={t1 - t0 <= MIN_SPAN}
          onClick={() => applyZoom(0.55, 0.5)}
        >
          <MagnifierIcon plus />
        </button>
      </div>
    </div>
  );

  return (
    <ChartCard title={title} right={controls}>
      <div ref={boxRef}>
        {props.variant === 'bar' ? (
          <TimeBar data={props.compute(windowWorkouts, gran)} format={props.format} height={height} />
        ) : (
          <TimeLine data={props.compute(windowWorkouts, gran)} format={props.format} height={height} />
        )}
      </div>
      <div className="mt-1 text-right text-[11px] text-muted">
        {GRAN_LABEL[gran]}
        {zoomed ? ' · scroll to zoom out' : ' · scroll to zoom in'}
      </div>
    </ChartCard>
  );
}
