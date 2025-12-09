import {
  IsArray,
  IsString,
  IsEnum,
  Matches,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DayOfWeek {
  MON = 'mon',
  TUE = 'tue',
  WED = 'wed',
  THU = 'thu',
  FRI = 'fri',
  SAT = 'sat',
  SUN = 'sun',
}

export class TimeSlotConfigDto {
  @ApiProperty({
    description: '가능한 요일 목록',
    enum: DayOfWeek,
    isArray: true,
    example: ['mon', 'tue', 'wed', 'thu', 'fri'],
  })
  @IsArray({ message: 'availableDays는 배열이어야 합니다.' })
  @ArrayNotEmpty({ message: 'availableDays는 최소 1개 이상이어야 합니다.' })
  @IsEnum(DayOfWeek, {
    each: true,
    message: '유효하지 않은 요일입니다.',
  })
  availableDays: DayOfWeek[];

  @ApiProperty({
    description: '시작 시간 (HH:mm)',
    example: '18:00',
  })
  @IsString({ message: 'startTime은 문자열이어야 합니다.' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: '시작 시간 형식은 HH:mm이어야 합니다.',
  })
  startTime: string;

  @ApiProperty({
    description: '종료 시간 (HH:mm)',
    example: '22:00',
  })
  @IsString({ message: 'endTime은 문자열이어야 합니다.' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: '종료 시간 형식은 HH:mm이어야 합니다.',
  })
  endTime: string;
}

export class UpdateOperatingHoursDto {
  @ApiProperty({
    description: '견적 시간 설정',
    type: TimeSlotConfigDto,
  })
  estimate: TimeSlotConfigDto;

  @ApiProperty({
    description: '시공 시간 설정',
    type: TimeSlotConfigDto,
  })
  construction: TimeSlotConfigDto;
}
