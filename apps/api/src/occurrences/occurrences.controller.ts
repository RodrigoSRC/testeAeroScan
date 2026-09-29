import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';
import { ListOccurrencesDto } from './dto/list-occurrences.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { OccurrencesService } from './occurrences.service';

@ApiTags('occurrences')
@Controller('occurrences')
export class OccurrencesController {
  constructor(private readonly occurrencesService: OccurrencesService) {}

  @Post()
  @ApiOperation({ summary: 'Register or group an occurrence' })
  create(@Body() dto: CreateOccurrenceDto) {
    return this.occurrencesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List occurrences by priority' })
  findAll(@Query() filters: ListOccurrencesDto) {
    return this.occurrencesService.findAll(filters);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Advance an occurrence status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.occurrencesService.updateStatus(id, dto);
  }
}
