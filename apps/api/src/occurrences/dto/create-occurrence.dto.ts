import { IsIn, IsInt, IsISO8601, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { OCCURRENCE_TYPES, OccurrenceType } from '../domain/occurrence.types';

export class CreateOccurrenceDto {
  @IsString()
  @IsNotEmpty()
  siteId!: string;

  @IsString()
  @IsNotEmpty()
  droneId!: string;

  @IsIn(OCCURRENCE_TYPES)
  type!: OccurrenceType;

  @IsInt()
  @Min(1)
  @Max(5)
  severity!: number;

  @IsISO8601()
  detectedAt!: string;
}
