import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TimeLinePoint, TimePoint } from '../../lib/metrics';
import ChartCard from '../ChartCard';
import TimeBar from './TimeBar';
import TimeLine from './TimeLine';

const MIN_POINTS = 3;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type Props =
  | { title: string; variant: 'bar'; data: TimePoint[]; format?: (v: number) => string; height?: number }
  | { title: string; variant: 'line'; data: TimeLinePoint[]; format?: (v: number) => string; height?: number };

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
  const { title, data, height = 320 } = props;
  const len = data.length;
  const sig = useMemo(
    () => `${len}|${data[0]?.key ?? ''}|${data[len - 1]?.key ?? ''}`,
    [data, len],
  );
  const [win, setWin] = useState({ start: 0, count: len });
  const boxRef = useRef<HTMLDivElement>(null);

  // reset the window when the underlying series actually changes (range/exercise)
  useEffect(() => {
    setWin({ start: 0, count: Math.max(len, 1) });
  }, [sig, len]);

  const applyZoom = useCallback(
    (factor: number, frac: number) => {
      setWin((prev) => {
        if (len === 0) return prev;
        const count = clamp(Math.round(prev.count * factor), Math.min(MIN_POINTS, len), len);
        const pivot = prev.start + frac * prev.count;
        const start = clamp(Math.round(pivot - frac * count), 0, Math.max(0, len - count));
        return { start, count };
      });
    },
    [len],
  );

  // native non-passive wheel listener so preventDefault works (page won't scroll)
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const frac = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      applyZoom(e.deltaY < 0 ? 0.8 : 1.25, frac);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [applyZoom]);

  const view = data.slice(win.start, win.start + win.count);
  const zoomed = win.count < len;
  const btn =
    'rounded border border-border p-1 text-muted transition hover:text-text disabled:cursor-default disabled:opacity-30';

  const controls = (
    <div className="flex gap-1">
      <button className={btn} title="Zoom out" disabled={win.count >= len} onClick={() => applyZoom(1.4, 0.5)}>
        <MagnifierIcon plus={false} />
      </button>
      <button
        className={btn}
        title="Zoom in"
        disabled={win.count <= Math.min(MIN_POINTS, len)}
        onClick={() => applyZoom(0.7, 0.5)}
      >
        <MagnifierIcon plus />
      </button>
    </div>
  );

  return (
    <ChartCard title={title} right={controls}>
      <div ref={boxRef}>
        {props.variant === 'bar' ? (
          <TimeBar data={view as TimePoint[]} format={props.format} height={height} />
        ) : (
          <TimeLine data={view as TimeLinePoint[]} format={props.format} height={height} />
        )}
      </div>
      {zoomed && (
        <div className="mt-1 text-right text-[11px] text-muted">
          Showing {win.start + 1}–{win.start + win.count} of {len} · scroll to zoom
        </div>
      )}
    </ChartCard>
  );
}
