import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Kitchen, KitchenSchema } from './kitchen.schema';
import { KitchenService } from './kitchen.service';
import { KitchenController } from './kitchen.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Kitchen.name, schema: KitchenSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [KitchenController],
  providers: [KitchenService],
  exports: [KitchenService],
})
export class KitchenModule {} 