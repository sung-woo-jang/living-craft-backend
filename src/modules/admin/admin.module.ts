import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DistrictsModule } from './districts/districts.module';
import { AdminReservationsModule } from './reservations/admin-reservations.module';
import { AdminServicesModule } from './services/admin-services.module';
import { AdminPortfoliosModule } from './portfolios/admin-portfolios.module';
import { AdminReviewsModule } from './reviews/admin-reviews.module';
import { AdminCustomersModule } from './customers/admin-customers.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DistrictsModule,
    AdminReservationsModule,
    AdminServicesModule,
    AdminPortfoliosModule,
    AdminReviewsModule,
    AdminCustomersModule,
  ],
})
export class AdminModule {}
