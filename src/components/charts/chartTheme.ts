export const CHART = {
  accent: '#3ecf8e',
  accentDim: '#3ecf8e26',
  dot: '#39d353',
  grid: '#30363d',
  axis: '#8b949e',
  panel: '#161b22',
  border: '#30363d',
  text: '#e6edf3',
};

const compact = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const compactNum = (v: number): string => compact.format(v);

export const tooltipStyle = {
  background: CHART.panel,
  border: `1px solid ${CHART.border}`,
  borderRadius: 6,
  color: CHART.text,
  fontSize: 12,
  padding: '6px 10px',
} as const;
