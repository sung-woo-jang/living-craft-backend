import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Reservation } from '@modules/reservations/entities/reservation.entity';
import { Quote } from '@modules/quotes/entities/quote.entity';
import { Review } from '@modules/reviews/entities/review.entity';
import { User } from '@modules/users/entities/user.entity';
import { Service } from '@modules/services/entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      Quote,
      Review,
      User,
      Service,
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
