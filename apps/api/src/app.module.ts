import { Controller, Get, Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { OccurrencesModule } from './occurrences/occurrences.module';

@Controller('health')
class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}

@Module({ imports: [DatabaseModule, OccurrencesModule], controllers: [HealthController] })
export class AppModule {}
