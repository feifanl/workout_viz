import type { HeatmapData } from '../lib/metrics';

const SCALE = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
const MMM = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT = 30; // room for weekday labels
const TOP = 16; // room for month labels

function shade(count: number): string {
  return SCALE[Math.min(count, SCALE.length - 1)];
}

interface Props {
  data: HeatmapData;
}

export default function Heatmap({ data }: Props) {
  const { days, weeks, total } = data;
  const width = LEFT + weeks * STEP;
  const height = TOP + 7 * STEP;

  // month labels: mark the first column whose Monday lands in a new month
  const monthLabels: { x: number; text: string }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const first = days[w * 7];
    if (!first) continue;
    const m = first.date.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ x: LEFT + w * STEP, text: MMM[m] });
      lastMonth = m;
    }
  }

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} role="img" aria-label="Workout consistency heatmap">
        {monthLabels.map((m) => (
          <text key={`${m.x}-${m.text}`} x={m.x} y={11} className="fill-muted" fontSize={10}>
            {m.text}
          </text>
        ))}

        {['Mon', 'Wed', 'Fri'].map((label, i) => (
          <text
            key={label}
            x={0}
            y={TOP + (i * 2) * STEP + CELL}
            className="fill-muted"
            fontSize={9}
          >
            {label}
          </text>
        ))}

        {days.map((d, i) => {
          const w = Math.floor(i / 7);
          const dow = i % 7;
          return (
            <rect
              key={i}
              x={LEFT + w * STEP}
              y={TOP + dow * STEP}
              width={CELL}
              height={CELL}
              rx={2}
              fill={shade(d.count)}
            >
              <title>
                {`${d.date.getDate()} ${MMM[d.date.getMonth()]} ${d.date.getFullYear()}: ${d.count} workout${d.count === 1 ? '' : 's'}`}
              </title>
            </rect>
          );
        })}
      </svg>

      <div className="mt-2 flex items-center gap-2 text-xs text-muted">
        <span>{total} workouts in the last year</span>
        <span className="ml-auto flex items-center gap-1">
          Less
          {SCALE.map((c) => (
            <span
              key={c}
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: c }}
            />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
