import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { OccurrencesController } from '../src/occurrences/occurrences.controller';
import { OccurrencesService } from '../src/occurrences/occurrences.service';

describe('OccurrencesController (e2e)', () => {
  let app: INestApplication;
  const service = {
    create: jest.fn(async () => ({ id: '1', status: 'open' })),
    findAll: jest.fn(async () => []),
    updateStatus: jest.fn(async () => ({ id: '1', status: 'acknowledged' })),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [OccurrencesController],
      providers: [{ provide: OccurrencesService, useValue: service }],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => app.close());

  it('accepts a valid occurrence payload', async () => {
    await request(app.getHttpServer())
      .post('/occurrences')
      .send({ siteId: 'site-a', droneId: 'drone-1', type: 'intrusion', severity: 3, detectedAt: '2026-09-28T12:00:00.000Z' })
      .expect(201)
      .expect({ id: '1', status: 'open' });
  });

  it('rejects an invalid occurrence payload', async () => {
    await request(app.getHttpServer())
      .post('/occurrences')
      .send({ siteId: '', type: 'unknown', severity: 9 })
      .expect(400);
  });

  it('routes list and status update requests to the service', async () => {
    await request(app.getHttpServer()).get('/occurrences?status=open&siteId=site-a').expect(200).expect([]);
    await request(app.getHttpServer()).patch('/occurrences/1/status').send({ status: 'acknowledged' }).expect(200);
    expect(service.findAll).toHaveBeenCalledWith({ status: 'open', siteId: 'site-a' });
    expect(service.updateStatus).toHaveBeenCalledWith('1', { status: 'acknowledged' });
  });
});
