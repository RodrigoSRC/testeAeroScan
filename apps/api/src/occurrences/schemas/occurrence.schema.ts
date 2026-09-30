import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OCCURRENCE_STATUSES, OCCURRENCE_TYPES, OccurrenceStatus, OccurrenceType } from '../domain/occurrence.types';

export type OccurrenceDocument = HydratedDocument<Occurrence>;

@Schema({ timestamps: true, versionKey: false })
export class Occurrence {
  @Prop({ required: true, trim: true, type: String })
  siteId!: string;

  @Prop({ required: true, trim: true, type: String })
  droneId!: string;

  @Prop({ required: true, enum: OCCURRENCE_TYPES, type: String })
  type!: OccurrenceType;

  @Prop({ required: true, min: 1, max: 5, type: Number })
  severity!: number;

  @Prop({ required: true, type: Date })
  detectedAt!: Date;

  @Prop({ required: true, enum: OCCURRENCE_STATUSES, default: 'open', type: String })
  status!: OccurrenceStatus;

  @Prop({ required: true, min: 1, default: 1, type: Number })
  count!: number;

  @Prop({ trim: true, type: String })
  note?: string;
}

export const OccurrenceSchema = SchemaFactory.createForClass(Occurrence);
OccurrenceSchema.index({ siteId: 1, type: 1, status: 1, detectedAt: -1 });
OccurrenceSchema.index({ status: 1, siteId: 1, detectedAt: -1 });
