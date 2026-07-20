import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base must match the GitHub Pages project subpath (repo name).
export default defineConfig({
  base: '/WorkoutMetricsViz/',
  plugins: [react()],
});
