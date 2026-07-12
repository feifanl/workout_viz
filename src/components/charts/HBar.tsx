import type { NamedValue } from '../../lib/metrics';
import { compactNum } from './chartTheme';

interface Props {
  data: NamedValue[];
  format?: (v: number) => string;
}

/**
 * Simple HTML/CSS horizontal bar list. Each row shows the category, a
 * proportional bar, and its value — so the numbers always have context
 * without needing a hover.
 */
export default function HBar({ data, format = compactNum }: Props) {
  const max = data.reduce((m, d) => Math.max(m, d.value), 0) || 1;
  return (
    <div className="space-y-1.5">
      {data.map((d) => (
        <div key={d.name} className="flex items-center gap-3 text-sm">
          <span className="w-48 flex-none truncate text-muted" title={d.name}>
            {d.name}
          </span>
          <div className="h-5 flex-1 rounded bg-elevate">
            <div
              className="h-full rounded bg-accent"
              style={{ width: `${Math.max((d.value / max) * 100, 1.5)}%` }}
            />
          </div>
          <span className="w-16 flex-none text-right tabular-nums text-text">
            {format(d.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
