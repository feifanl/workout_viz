import { useState } from 'react';
import { parseCsv, type ParseResult } from '../lib/parse';
import type { Unit } from '../lib/units';
import UploadZone from '../components/UploadZone';
import LoadingScreen from '../components/LoadingScreen';
import Dashboard from '../components/Dashboard';

type Status = 'idle' | 'loading' | 'ready';

const MIN_LOADING_MS = 700;

interface Props {
  unit: Unit;
}

export default function Visualize({ unit }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);
    setStatus('loading');
    const started = Date.now();
    file
      .text()
      .then((text) => {
        const res = parseCsv(text);
        const wait = Math.max(0, MIN_LOADING_MS - (Date.now() - started));
        setTimeout(() => {
          if (res.errors.length > 0) {
            setError(res.errors[0]);
            setStatus('idle');
            return;
          }
          setResult(res);
          setStatus('ready');
        }, wait);
      })
      .catch(() => {
        setError('Could not read that file. Make sure it is a Hevy CSV export.');
        setStatus('idle');
      });
  }

  function reset() {
    setResult(null);
    setError(null);
    setStatus('idle');
  }

  if (status === 'loading') return <LoadingScreen />;

  if (status === 'ready' && result) {
    return (
      <Dashboard
        workouts={result.workouts}
        unit={unit}
        onReset={reset}
        skippedRows={result.skippedRows}
      />
    );
  }

  return <UploadZone onFile={handleFile} error={error} />;
}
