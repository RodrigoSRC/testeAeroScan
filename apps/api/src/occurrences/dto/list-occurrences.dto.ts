import { IsIn, IsOptional, IsString } from 'class-validator';
import { OCCURRENCE_STATUSES, OccurrenceStatus } from '../domain/occurrence.types';

export class ListOccurrencesDto {
  @IsOptional()
  @IsIn(OCCURRENCE_STATUSES)
  status?: OccurrenceStatus;

  @IsOptional()
  @IsString()
  siteId?: string;
}
