import { useEffect, useRef, useState } from 'react';

interface Props {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export default function ExerciseSelect({ options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  function choose(o: string) {
    onChange(o);
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={ref} className="relative w-56">
      <button
        className="flex w-full items-center justify-between rounded-md border border-border bg-panel px-3 py-1.5 text-left text-sm hover:border-accent/50"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate">{value || 'Select exercise'}</span>
        <span className="ml-2 text-muted">▾</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-border bg-panel shadow-lg">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-t-md border-b border-border bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-muted"
          />
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-1.5 text-sm text-muted">No matches</li>
            )}
            {filtered.map((o) => (
              <li key={o}>
                <button
                  className={`block w-full truncate px-3 py-1.5 text-left text-sm transition hover:bg-accent-dim ${
                    o === value ? 'text-accent' : 'text-text'
                  }`}
                  onClick={() => choose(o)}
                >
                  {o}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
