import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from './entities';
import { PromotionsService } from './promotions.service';
import {
  PromotionsController,
  AdminPromotionsController,
} from './promotions.controller';
import { FilesModule } from '@modules/files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion]), FilesModule],
  controllers: [PromotionsController, AdminPromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
