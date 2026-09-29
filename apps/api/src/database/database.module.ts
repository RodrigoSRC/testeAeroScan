import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? 'mongodb://aeroscan:aeroscan@localhost:27017/aeroscan?authSource=admin',
    ),
  ],
})
export class DatabaseModule {}
