import 'reflect-metadata';
import { connect, disconnect } from 'mongoose';
import { OccurrenceSchema } from './schemas/occurrence.schema';

async function seed() {
  const uri = process.env.MONGODB_URI ?? 'mongodb://aeroscan:aeroscan@localhost:27017/aeroscan?authSource=admin';
  const connection = await connect(uri);
  const model = connection.connection.model('Occurrence', OccurrenceSchema);
  await model.deleteMany({});
  await model.insertMany([
    {
      siteId: 'site-a',
      droneId: 'drone-01',
      type: 'intrusion',
      severity: 4,
      detectedAt: new Date(),
      status: 'open',
      count: 1,
    },
    {
      siteId: 'site-b',
      droneId: 'drone-02',
      type: 'low_battery',
      severity: 2,
      detectedAt: new Date(),
      status: 'open',
      count: 1,
    },
  ]);
  await disconnect();
}

void seed().catch(async (error: unknown) => {
  console.error(error);
  await disconnect();
  process.exitCode = 1;
});
