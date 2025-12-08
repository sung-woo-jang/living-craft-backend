import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ServicesModule } from '@modules/services/services.module';
import { SettingsModule } from '@modules/settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation]),
    ServicesModule,
    SettingsModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
