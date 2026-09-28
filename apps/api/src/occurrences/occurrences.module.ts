import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TriageService } from './domain/triage.service';
import { OccurrencesController } from './occurrences.controller';
import { OccurrencesService } from './occurrences.service';
import { Occurrence, OccurrenceSchema } from './schemas/occurrence.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Occurrence.name, schema: OccurrenceSchema }])],
  controllers: [OccurrencesController],
  providers: [OccurrencesService, TriageService],
})
export class OccurrencesModule {}
