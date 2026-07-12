const METRICS = [
  'Workout frequency, duration, total volume and total working sets over time',
  'Per-exercise volume, working sets and best weight, plus set duration for timed moves',
  'Muscle group distribution and your favorite exercises and muscles',
  'Neglected muscles — how long since you last trained each one',
  'A GitHub-style consistency heatmap for the trailing year',
];

const STEPS = [
  'Open the Profile tab, then Settings (gear icon)',
  'Choose “Export & Import Data” → “Export Workouts”',
  'Download the CSV from the email Hevy sends you',
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">{title}</h2>
      {children}
    </section>
  );
}

export default function About() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10 text-sm leading-relaxed">
      <div>
        <h1 className="text-2xl font-semibold">About Hevy Viz</h1>
        <p className="mt-2 text-muted">
          A small, fully client-side tool for exploring advanced metrics from your
          Hevy workout history. Upload a CSV, read your charts, close the tab — no
          account, no backend, no storage.
        </p>
      </div>

      <Section title="What you get">
        <ul className="list-disc space-y-1 pl-5 text-muted">
          {METRICS.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </Section>

      <Section title="How to export from Hevy">
        <ol className="list-decimal space-y-1 pl-5 text-muted">
          {STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </Section>

      <Section title="What isn’t supported">
        <p className="text-muted">
          Rest-time analysis and body-weight tracking aren’t available — the Hevy
          CSV export doesn’t include either.
        </p>
      </Section>

      <Section title="Privacy">
        <p className="text-muted">
          Your data never leaves your browser. The CSV is parsed locally and kept
          only in memory for the current session.
        </p>
      </Section>

      <p className="text-xs text-muted">Not affiliated with Hevy.</p>
    </div>
  );
}
