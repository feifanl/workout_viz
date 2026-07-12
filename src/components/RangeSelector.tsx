import { RANGES, type RangeKey } from '../lib/buckets';

interface Props {
  value: RangeKey;
  onChange: (r: RangeKey) => void;
}

export default function RangeSelector({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-md border border-border bg-panel p-0.5">
      {RANGES.map((r) => (
        <button
          key={r}
          className={`rounded px-3 py-1 text-sm transition ${
            value === r ? 'bg-accent-dim text-accent' : 'text-muted hover:text-text'
          }`}
          onClick={() => onChange(r)}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
