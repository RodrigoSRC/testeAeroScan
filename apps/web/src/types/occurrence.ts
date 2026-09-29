export const occurrenceStatuses = ['open', 'acknowledged', 'resolved'] as const;
export type OccurrenceStatus = (typeof occurrenceStatuses)[number];
export type Occurrence = {
  id: string;
  siteId: string;
  droneId: string;
  type: string;
  severity: number;
  detectedAt: string;
  status: OccurrenceStatus;
  count: number;
  priority: number;
  note?: string;
};
