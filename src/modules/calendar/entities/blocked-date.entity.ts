import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';

@Entity('blocked_dates')
@Index(['blockedDate'], { unique: true })
export class BlockedDate extends BaseEntity {
  @ApiProperty({
    description: '차단된 날짜',
    example: '2024-01-15',
  })
  @Column({ type: 'date', unique: true })
  blockedDate: Date;

  @ApiProperty({
    description: '차단 사유',
    example: '개인 사유',
    required: false,
  })
  @Column({ nullable: true })
  reason?: string;

  constructor(partial: Partial<BlockedDate> = {}) {
    super();
    Object.assign(this, partial);
  }
}
