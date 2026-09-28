export const OCCURRENCE_TYPES = [
  'intrusion',
  'perimeter_breach',
  'low_battery',
  'signal_loss',
] as const;

export type OccurrenceType = (typeof OCCURRENCE_TYPES)[number];
export const OCCURRENCE_STATUSES = ['open', 'acknowledged', 'resolved'] as const;
export type OccurrenceStatus = (typeof OCCURRENCE_STATUSES)[number];
