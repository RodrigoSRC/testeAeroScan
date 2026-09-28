import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TriageService } from './domain/triage.service';
import { OccurrenceType, OccurrenceStatus } from './domain/occurrence.types';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';
import { ListOccurrencesDto } from './dto/list-occurrences.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Occurrence, OccurrenceDocument } from './schemas/occurrence.schema';

export type OccurrenceResponse = {
  id: string;
  siteId: string;
  droneId: string;
  type: OccurrenceType;
  severity: number;
  detectedAt: string;
  status: OccurrenceStatus;
  count: number;
  note?: string;
  priority: number;
};

@Injectable()
export class OccurrencesService {
  constructor(
    @InjectModel(Occurrence.name) private readonly occurrenceModel: Model<OccurrenceDocument>,
    private readonly triageService: TriageService,
  ) {}

  async create(dto: CreateOccurrenceDto): Promise<OccurrenceResponse> {
    const detectedAt = new Date(dto.detectedAt);
    const windowStart = new Date(detectedAt.getTime() - 10 * 60 * 1000);
    const existing = await this.occurrenceModel
      .findOne({
        siteId: dto.siteId,
        type: dto.type,
        status: 'open',
        detectedAt: { $gte: windowStart, $lte: detectedAt },
      })
      .sort({ detectedAt: -1 })
      .exec();

    if (existing) {
      existing.count += 1;
      existing.severity = this.triageService.incrementSeverity(existing.severity);
      return this.toResponse(await existing.save());
    }

    const created = await this.occurrenceModel.create({
      siteId: dto.siteId,
      droneId: dto.droneId,
      type: dto.type,
      severity: dto.severity,
      detectedAt,
      status: 'open',
      count: 1,
    });
    return this.toResponse(created);
  }

  async findAll(filters: ListOccurrencesDto): Promise<OccurrenceResponse[]> {
    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;
    if (filters.siteId) query.siteId = filters.siteId;

    const occurrences = await this.occurrenceModel.find(query).exec();
    return occurrences
      .map((occurrence) => this.toResponse(occurrence))
      .sort((a, b) => b.priority - a.priority || Date.parse(b.detectedAt) - Date.parse(a.detectedAt));
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<OccurrenceResponse> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Occurrence not found');
    const occurrence = await this.occurrenceModel.findById(id).exec();
    if (!occurrence) throw new NotFoundException('Occurrence not found');

    this.triageService.validateTransition(occurrence.status, dto.status, dto.note);
    occurrence.status = dto.status;
    if (dto.note) occurrence.note = dto.note;
    return this.toResponse(await occurrence.save());
  }

  private toResponse(occurrence: OccurrenceDocument): OccurrenceResponse {
    return {
      id: occurrence._id.toString(),
      siteId: occurrence.siteId,
      droneId: occurrence.droneId,
      type: occurrence.type,
      severity: occurrence.severity,
      detectedAt: occurrence.detectedAt.toISOString(),
      status: occurrence.status,
      count: occurrence.count,
      ...(occurrence.note ? { note: occurrence.note } : {}),
      priority: this.triageService.calculatePriority(occurrence.type, occurrence.severity),
    };
  }
}
