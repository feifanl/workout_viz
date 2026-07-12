import { useState } from 'react';
import Header, { type View } from './components/Header';
import type { Unit } from './lib/units';
import Visualize from './pages/Visualize';
import About from './pages/About';

export default function App() {
  const [view, setView] = useState<View>('visualize');
  const [unit, setUnit] = useState<Unit>('lbs');

  return (
    <div className="min-h-full">
      <Header view={view} onView={setView} unit={unit} onUnit={setUnit} />
      {view === 'visualize' ? <Visualize unit={unit} /> : <About />}
    </div>
  );
}
