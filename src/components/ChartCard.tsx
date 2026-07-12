import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  right?: ReactNode;
}

export default function ChartCard({ title, children, right }: Props) {
  return (
    <div className="rounded-lg border border-border bg-panel p-4 transition hover:border-accent/40">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}
