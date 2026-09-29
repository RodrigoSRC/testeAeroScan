import type { Occurrence, OccurrenceStatus } from '../types/occurrence';

const apiUrl = import.meta.env.VITE_API_URL ?? '';

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`Erro na API (${response.status})`);
  return response.json() as Promise<T>;
}

export async function fetchOccurrences(status?: OccurrenceStatus | ''): Promise<Occurrence[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  const query = params.toString();
  const response = await fetch(`${apiUrl}/occurrences${query ? `?${query}` : ''}`);
  return readResponse<Occurrence[]>(response);
}

export async function updateOccurrenceStatus(id: string, status: OccurrenceStatus, note?: string): Promise<Occurrence> {
  const response = await fetch(`${apiUrl}/occurrences/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, ...(note ? { note } : {}) }),
  });
  return readResponse<Occurrence>(response);
}
