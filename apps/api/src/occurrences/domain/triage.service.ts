import { ConflictException, Injectable } from '@nestjs/common';
import { OccurrenceStatus, OccurrenceType } from './occurrence.types';

const TYPE_WEIGHTS: Record<OccurrenceType, number> = {
  intrusion: 3,
  perimeter_breach: 2,
  low_battery: 1,
  signal_loss: 1,
};

@Injectable()
export class TriageService {
  getTypeWeight(type: OccurrenceType): number {
    return TYPE_WEIGHTS[type];
  }

  calculatePriority(type: OccurrenceType, severity: number): number {
    return severity * this.getTypeWeight(type);
  }

  incrementSeverity(severity: number): number {
    return Math.min(severity + 1, 5);
  }

  validateTransition(from: OccurrenceStatus, to: OccurrenceStatus, note?: string): void {
    const valid = from === 'open' && to === 'acknowledged';
    const resolving = from === 'acknowledged' && to === 'resolved';

    if (!valid && !resolving) {
      throw new ConflictException(`Invalid status transition: ${from} -> ${to}`);
    }

    if (resolving && !note?.trim()) {
      throw new ConflictException('A resolution note is required');
    }
  }
}
