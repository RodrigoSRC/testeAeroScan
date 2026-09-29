import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { fetchOccurrences, updateOccurrenceStatus } from './api/occurrences';
import type { Occurrence, OccurrenceStatus } from './types/occurrence';

const noteSchema = z.object({ note: z.string().trim().min(1, 'Informe a nota de resolução') });
type NoteForm = z.infer<typeof noteSchema>;
const statusLabels: Record<OccurrenceStatus, string> = { open: 'Aberta', acknowledged: 'Reconhecida', resolved: 'Resolvida' };
const typeLabels: Record<string, string> = { intrusion: 'Intrusão', fire: 'Incêndio', obstacle: 'Obstáculo', anomaly: 'Anomalia' };

export function App() {
  const [status, setStatus] = useState<OccurrenceStatus | ''>('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: occurrences = [], isLoading, isError } = useQuery({ queryKey: ['occurrences', status], queryFn: () => fetchOccurrences(status) });
  const mutation = useMutation({
    mutationFn: ({ id, nextStatus, note }: { id: string; nextStatus: OccurrenceStatus; note?: string }) => updateOccurrenceStatus(id, nextStatus, note),
    onSuccess: () => { setResolvingId(null); queryClient.invalidateQueries({ queryKey: ['occurrences'] }); },
  });

  return (
    <main className="app-shell">
      <header className="page-header">
        <div><p className="eyebrow">AeroScan · Operações</p><h1>Triagem de ocorrências</h1><p className="subtitle">Acompanhe alertas dos drones e atualize o atendimento em tempo real.</p></div>
        <div className="summary" aria-label="Resumo"><strong>{occurrences.length}</strong><span>ocorrências exibidas</span></div>
      </header>
      <section className="toolbar" aria-label="Filtros">
        <label htmlFor="status-filter">Filtrar por status</label>
        <select id="status-filter" aria-label="Filtrar por status" value={status} onChange={(event) => setStatus(event.target.value as OccurrenceStatus | '')}>
          <option value="">Todos os status</option><option value="open">Abertas</option><option value="acknowledged">Reconhecidas</option><option value="resolved">Resolvidas</option>
        </select>
      </section>
      {isLoading && <p className="feedback">Carregando ocorrências...</p>}
      {isError && <p className="feedback error">Não foi possível carregar as ocorrências.</p>}
      {!isLoading && !isError && occurrences.length === 0 && <p className="feedback">Nenhuma ocorrência encontrada para este filtro.</p>}
      <section className="occurrence-list" aria-label="Lista de ocorrências">
        {occurrences.map((occurrence) => <OccurrenceCard key={occurrence.id} occurrence={occurrence} isResolving={resolvingId === occurrence.id} isPending={mutation.isPending} onAcknowledge={() => mutation.mutate({ id: occurrence.id, nextStatus: 'acknowledged' })} onResolveStart={() => setResolvingId(occurrence.id)} onCancelResolve={() => setResolvingId(null)} onResolve={(note) => mutation.mutate({ id: occurrence.id, nextStatus: 'resolved', note })} />)}
      </section>
    </main>
  );
}

function OccurrenceCard({ occurrence, isResolving, isPending, onAcknowledge, onResolveStart, onCancelResolve, onResolve }: { occurrence: Occurrence; isResolving: boolean; isPending: boolean; onAcknowledge: () => void; onResolveStart: () => void; onCancelResolve: () => void; onResolve: (note: string) => void }) {
  const form = useForm<NoteForm>({ resolver: zodResolver(noteSchema) });
  const type = typeLabels[occurrence.type] ?? occurrence.type;
  return <article className="occurrence-card">
    <div className="card-topline"><span className={`status-badge status-${occurrence.status}`}>{statusLabels[occurrence.status]}</span><span className="detected-at">{new Date(occurrence.detectedAt).toLocaleString('pt-BR')}</span></div>
    <div className="card-heading"><div><h2>{type}</h2><p className="location">Site {occurrence.siteId} · Drone {occurrence.droneId}</p></div><span className="severity-badge">Severidade {occurrence.severity}</span></div>
    <div className="card-meta"><span>Prioridade {occurrence.priority}</span>{occurrence.count > 1 && <span>{occurrence.count} ocorrências</span>}</div>
    {occurrence.status === 'open' && <button className="primary-button" type="button" onClick={onAcknowledge} disabled={isPending}>Reconhecer</button>}
    {occurrence.status === 'acknowledged' && !isResolving && <button className="primary-button" type="button" onClick={onResolveStart} disabled={isPending}>Resolver</button>}
    {isResolving && <form className="resolve-form" onSubmit={form.handleSubmit(({ note }) => onResolve(note.trim()))}><label htmlFor={`note-${occurrence.id}`}>Nota de resolução</label><textarea id={`note-${occurrence.id}`} {...form.register('note')} rows={3} />{form.formState.errors.note && <span className="field-error">{form.formState.errors.note.message}</span>}<div className="form-actions"><button className="primary-button" type="submit" disabled={isPending}>Confirmar resolução</button><button className="secondary-button" type="button" onClick={onCancelResolve}>Cancelar</button></div></form>}
  </article>;
}
