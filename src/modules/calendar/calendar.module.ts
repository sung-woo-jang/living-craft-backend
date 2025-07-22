import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { CalendarSetting } from './entities/calendar-setting.entity';
import { BlockedDate } from './entities/blocked-date.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarSetting, BlockedDate])],
  providers: [CalendarService],
  controllers: [CalendarController],
  exports: [CalendarService],
})
export class CalendarModule {}
