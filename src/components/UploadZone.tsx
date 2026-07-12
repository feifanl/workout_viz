import { useRef, useState } from 'react';

interface Props {
  onFile: (file: File) => void;
  error?: string | null;
}

const STEPS = [
  'Open the Profile tab, then Settings (gear icon)',
  'Choose “Export & Import Data” → “Export Workouts”',
  'Download the CSV from the email Hevy sends you',
];

export default function UploadZone({ onFile, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function pick(files: FileList | null) {
    if (files && files[0]) onFile(files[0]);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Visualize your Hevy workouts</h1>
      <p className="mt-2 text-muted">
        Upload a Hevy CSV export to see your training metrics. Nothing is uploaded
        anywhere — it all runs in your browser.
      </p>

      <ol className="mt-6 space-y-2 text-sm text-muted">
        {STEPS.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full border border-border text-xs text-muted">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      <div
        className={`mt-8 cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition ${
          drag ? 'border-accent bg-accent-dim' : 'border-border hover:border-accent/60'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          pick(e.dataTransfer.files);
        }}
      >
        <p className="font-medium">Drop your CSV here</p>
        <p className="mt-1 text-sm text-muted">or</p>
        <button className="mt-3 rounded-md bg-accent px-4 py-2 font-medium text-bg transition hover:brightness-110">
          Choose file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => pick(e.target.files)}
        />
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <p className="mt-6 text-center text-xs text-muted">
        Your data never leaves your browser.
      </p>
    </div>
  );
}
