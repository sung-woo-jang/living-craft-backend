import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service, ServiceRegion } from '@modules/services/entities';
import { District } from '@modules/admin/districts/entities';
import { AdminServicesController } from './admin-services.controller';
import { AdminServicesService } from './admin-services.service';

@Module({
  imports: [TypeOrmModule.forFeature([Service, ServiceRegion, District])],
  controllers: [AdminServicesController],
  providers: [AdminServicesService],
  exports: [AdminServicesService],
})
export class AdminServicesModule {}
