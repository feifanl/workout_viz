interface Props {
  label: string;
  value: string;
}

export default function StatTile({ label, value }: Props) {
  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <div className="text-2xl font-semibold text-text">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}
