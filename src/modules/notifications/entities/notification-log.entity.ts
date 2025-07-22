import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';
import { NotificationType, NotificationChannel } from './notification-template.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';

export enum NotificationStatus {
  SENT = 'sent',
  FAILED = 'failed',
  PENDING = 'pending',
}

@Entity('notification_logs')
@Index(['status'])
@Index(['type'])
@Index(['sentAt'])
export class NotificationLog extends BaseEntity {
  @ApiProperty({
    description: '알림 타입',
    enum: NotificationType,
    example: NotificationType.RESERVATION_CONFIRMED,
  })
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @ApiProperty({
    description: '발송 채널',
    enum: NotificationChannel,
    example: NotificationChannel.SMS,
  })
  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @ApiProperty({
    description: '수신자',
    example: '010-1234-5678',
  })
  @Column()
  recipient: string;

  @ApiProperty({
    description: '발송 내용',
    example: '안녕하세요 홍길동님, 예약번호 20240101-0001이 확정되었습니다.',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    description: '발송 상태',
    enum: NotificationStatus,
    example: NotificationStatus.SENT,
  })
  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @ApiProperty({
    description: '실패 사유',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @ApiProperty({
    description: '발송 일시',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @ApiProperty({
    description: '재시도 횟수',
    example: 0,
  })
  @Column({ default: 0 })
  retryCount: number;

  // Relations
  @ManyToOne(() => Reservation, { nullable: true })
  @JoinColumn({ name: 'reservationId' })
  reservation?: Reservation;

  @Column({ nullable: true })
  reservationId?: number;

  constructor(partial: Partial<NotificationLog> = {}) {
    super();
    Object.assign(this, partial);
  }
}
