export type Unit = 'kg' | 'lbs';

const LBS_PER_KG = 2.2046226218;

/** Convert a stored kg value to the display unit. */
export function toDisplayWeight(kg: number, unit: Unit): number {
  return unit === 'lbs' ? kg * LBS_PER_KG : kg;
}

/** Weight with 1 decimal + unit suffix; em dash for null. */
export function formatWeight(kg: number | null, unit: Unit): string {
  if (kg === null) return '—';
  return `${toDisplayWeight(kg, unit).toFixed(1)} ${unit}`;
}

/** Volume (a weight-dimension sum) rounded to nearest integer + unit suffix. */
export function formatVolume(volumeKg: number, unit: Unit): string {
  return `${Math.round(toDisplayWeight(volumeKg, unit)).toLocaleString()} ${unit}`;
}
