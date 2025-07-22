import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Deal, DealSchema } from './deals.schema';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Deal.name, schema: DealSchema }])],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {} 