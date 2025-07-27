import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { NaverStrategy } from './strategies/naver.strategy';
import { UsersModule } from '../users/users.module';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [ConfigModule, UsersModule, ReservationsModule],
  providers: [AuthService, JwtStrategy, LocalStrategy, NaverStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
