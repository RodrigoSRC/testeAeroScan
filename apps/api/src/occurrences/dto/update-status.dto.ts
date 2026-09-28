import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OccurrenceStatus } from '../domain/occurrence.types';

export class UpdateStatusDto {
  @IsIn(['acknowledged', 'resolved'])
  status!: Exclude<OccurrenceStatus, 'open'>;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  note?: string;
}
