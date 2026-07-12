import type { Unit } from '../lib/units';

export type View = 'visualize' | 'about';

interface Props {
  view: View;
  onView: (v: View) => void;
  unit: Unit;
  onUnit: (u: Unit) => void;
}

function segClass(active: boolean): string {
  return `px-3 py-1 text-sm rounded-md transition ${
    active ? 'bg-elevate text-accent' : 'text-muted hover:text-text'
  }`;
}

export default function Header({ view, onView, unit, onUnit }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="font-semibold tracking-tight">Hevy Viz</div>

        <nav className="flex items-center gap-1">
          <button className={segClass(view === 'visualize')} onClick={() => onView('visualize')}>
            Visualize
          </button>
          <button className={segClass(view === 'about')} onClick={() => onView('about')}>
            About
          </button>
        </nav>

        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          {(['lbs', 'kg'] as Unit[]).map((u) => (
            <button
              key={u}
              className={`rounded px-2 py-0.5 text-sm transition ${
                unit === u ? 'bg-elevate text-accent' : 'text-muted hover:text-text'
              }`}
              onClick={() => onUnit(u)}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
