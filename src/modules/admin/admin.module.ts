import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DistrictsModule } from './districts/districts.module';

@Module({
  imports: [AuthModule, UsersModule, DistrictsModule],
})
export class AdminModule {}
