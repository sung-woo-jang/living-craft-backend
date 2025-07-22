import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

// Config
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import naverConfig from './config/naver.config';
import adminConfig from './config/admin.config';

// Common
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ServicesModule } from './modules/services/services.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FaqModule } from './modules/faq/faq.module';
import { FilesModule } from './modules/files/files.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, naverConfig, adminConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('database'),
      inject: [ConfigService],
    }),

    // JWT
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),

    // Scheduling for background tasks
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    ServicesModule,
    ReservationsModule,
    QuotesModule,
    ReviewsModule,
    CalendarModule,
    PortfolioModule,
    NotificationsModule,
    FaqModule,
    FilesModule,
    HealthModule,
  ],
  providers: [
    // Global JWT Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
