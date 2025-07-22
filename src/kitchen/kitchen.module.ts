import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Kitchen, KitchenSchema } from './kitchen.schema';
import { KitchenStaff, KitchenStaffSchema } from './kitchen-staff.schema';
import { KitchenService } from './kitchen.service';
import { KitchenController } from './kitchen.controller';
import { KitchenAuthController } from './kitchen-auth.controller';
import { KitchenAuthService } from './kitchen-auth.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Kitchen.name, schema: KitchenSchema },
      { name: KitchenStaff.name, schema: KitchenStaffSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => AuthModule),
  ],
  controllers: [KitchenController, KitchenAuthController],
  providers: [KitchenService, KitchenAuthService],
  exports: [KitchenService, KitchenAuthService],
})
export class KitchenModule {}
