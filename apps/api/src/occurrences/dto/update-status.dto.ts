import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OCCURRENCE_STATUSES, OccurrenceStatus } from '../domain/occurrence.types';

export class UpdateStatusDto {
  @IsIn(OCCURRENCE_STATUSES)
  status!: OccurrenceStatus;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  note?: string;
}
