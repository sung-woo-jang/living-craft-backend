import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Reservation } from '@modules/reservations/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Reservation])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
