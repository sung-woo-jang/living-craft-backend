import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';

@Entity('calendar_settings')
@Index(['dayOfWeek'], { unique: true })
export class CalendarSetting extends BaseEntity {
  @ApiProperty({
    description: '요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)',
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @Column()
  dayOfWeek: number;

  @ApiProperty({
    description: '영업 시작 시간',
    example: '09:00',
    required: false,
  })
  @Column({ type: 'time', nullable: true })
  openTime?: string;

  @ApiProperty({
    description: '영업 종료 시간',
    example: '18:00',
    required: false,
  })
  @Column({ type: 'time', nullable: true })
  closeTime?: string;

  @ApiProperty({
    description: '휴무일 여부',
    example: false,
  })
  @Column({ default: false })
  isHoliday: boolean;

  constructor(partial: Partial<CalendarSetting> = {}) {
    super();
    Object.assign(this, partial);
  }
}
