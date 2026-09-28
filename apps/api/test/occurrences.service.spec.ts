import { ConflictException, NotFoundException } from '@nestjs/common';
import { OccurrencesService } from '../src/occurrences/occurrences.service';
import { TriageService } from '../src/occurrences/domain/triage.service';

function document(overrides: Record<string, unknown> = {}) {
  const value: any = {
    _id: { toString: () => 'occurrence-id' },
    siteId: 'site-a',
    droneId: 'drone-1',
    type: 'intrusion',
    severity: 3,
    detectedAt: new Date('2026-09-28T12:00:00.000Z'),
    status: 'open',
    count: 1,
    save: jest.fn(async () => value),
    ...overrides,
  };
  return value;
}

describe('OccurrencesService', () => {
  it('groups a matching open occurrence and caps the severity', async () => {
    const existing = document({ severity: 5, count: 2 });
    const model: any = {
      findOne: jest.fn(() => ({ sort: jest.fn(() => ({ exec: jest.fn(async () => existing) })) })),
    };
    const service = new OccurrencesService(model, new TriageService());

    const result = await service.create({
      siteId: 'site-a',
      droneId: 'drone-2',
      type: 'intrusion',
      severity: 1,
      detectedAt: '2026-09-28T12:05:00.000Z',
    });

    expect(existing.count).toBe(3);
    expect(existing.severity).toBe(5);
    expect(result.priority).toBe(15);
  });

  it('sorts the list by priority and then by most recent detection', async () => {
    const model: any = {
      find: jest.fn(() => ({ exec: jest.fn(async () => [
        document({ _id: { toString: () => 'low' }, type: 'low_battery', severity: 5 }),
        document({ _id: { toString: () => 'high' }, type: 'intrusion', severity: 3 }),
      ]) })),
    };
    const service = new OccurrencesService(model, new TriageService());

    const result = await service.findAll({});

    expect(result.map((item) => item.id)).toEqual(['high', 'low']);
  });

  it('rejects an invalid transition and unknown occurrence', async () => {
    const model: any = {
      findById: jest.fn(() => ({ exec: jest.fn(async () => document()) })),
    };
    const service = new OccurrencesService(model, new TriageService());

    await expect(service.updateStatus('507f1f77bcf86cd799439011', { status: 'resolved', note: undefined })).rejects.toThrow(ConflictException);
    await expect(service.updateStatus('not-an-id', { status: 'acknowledged' })).rejects.toThrow(NotFoundException);
  });
});
