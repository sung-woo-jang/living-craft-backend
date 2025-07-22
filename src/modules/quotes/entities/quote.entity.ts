import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';
import { QuoteStatus } from '@common/enums';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity('quotes')
export class Quote extends BaseEntity {
  @ApiProperty({
    description: '견적 가격',
    example: 80000,
    required: false,
  })
  @Column({ nullable: true })
  quotedPrice?: number;

  @ApiProperty({
    description: '견적 제안 날짜',
    example: '2024-01-15',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  quotedDate?: Date;

  @ApiProperty({
    description: '견적 제안 시간',
    example: '14:00',
    required: false,
  })
  @Column({ type: 'time', nullable: true })
  quotedTime?: string;

  @ApiProperty({
    description: '예상 소요시간 (분)',
    example: 180,
    required: false,
  })
  @Column({ nullable: true })
  quotedDuration?: number;

  @ApiProperty({
    description: '견적 설명',
    example: '추가 작업이 필요하여 견적이 상향 조정되었습니다.',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: '견적 상태',
    enum: QuoteStatus,
    example: QuoteStatus.SENT,
  })
  @Column({
    type: 'enum',
    enum: QuoteStatus,
    default: QuoteStatus.PENDING,
  })
  status: QuoteStatus;

  @ApiProperty({
    description: '거절 사유',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  rejectedReason?: string;

  // Relations
  @OneToOne(() => Reservation, reservation => reservation.quote, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservation;

  @Column()
  reservationId: number;

  constructor(partial: Partial<Quote> = {}) {
    super();
    Object.assign(this, partial);
  }
}
