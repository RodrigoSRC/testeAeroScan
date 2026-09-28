import { ConflictException } from '@nestjs/common';
import { TriageService } from '../src/occurrences/domain/triage.service';

describe('TriageService', () => {
  const service = new TriageService();

  it('calculates priority from severity and occurrence type weight', () => {
    expect(service.calculatePriority('intrusion', 3)).toBe(9);
    expect(service.calculatePriority('perimeter_breach', 4)).toBe(8);
    expect(service.calculatePriority('low_battery', 5)).toBe(5);
  });

  it('increments severity without exceeding five when an occurrence is grouped', () => {
    expect(service.incrementSeverity(2)).toBe(3);
    expect(service.incrementSeverity(5)).toBe(5);
  });

  it('allows only the prescribed status transitions', () => {
    expect(() => service.validateTransition('open', 'acknowledged')).not.toThrow();
    expect(() => service.validateTransition('acknowledged', 'resolved', 'Resolved at gate')).not.toThrow();
    expect(() => service.validateTransition('open', 'resolved')).toThrow(ConflictException);
    expect(() => service.validateTransition('acknowledged', 'resolved')).toThrow(ConflictException);
  });
});
