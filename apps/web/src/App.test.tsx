import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

const occurrence = {
  id: 'occurrence-1',
  siteId: 'site-a',
  droneId: 'drone-1',
  type: 'intrusion',
  severity: 4,
  detectedAt: '2026-09-28T12:00:00.000Z',
  status: 'acknowledged',
  count: 2,
  priority: 12,
};

function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('App', () => {
  it('shows severity, repeated count and status filter', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([occurrence]), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    renderApp();

    expect(await screen.findByText(/site-a/)).toBeInTheDocument();
    expect(screen.getByText('Severidade 4')).toBeInTheDocument();
    expect(screen.getByText('2 ocorrências')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Filtrar por status' })).toBeInTheDocument();
  });

  it('requires a note and updates an acknowledged occurrence when resolving', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify([occurrence]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...occurrence, status: 'resolved', note: 'Portão revisado' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ ...occurrence, status: 'resolved', note: 'Portão revisado' }]), { status: 200 }));
    const user = userEvent.setup();

    renderApp();
    await screen.findByText(/site-a/);
    await user.click(screen.getByRole('button', { name: 'Resolver' }));
    expect(screen.getByRole('textbox', { name: 'Nota de resolução' })).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Nota de resolução' }), 'Portão revisado');
    await user.click(screen.getByRole('button', { name: 'Confirmar resolução' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/occurrences\/occurrence-1\/status$/), expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ status: 'resolved', note: 'Portão revisado' }),
    })));
  });
});
