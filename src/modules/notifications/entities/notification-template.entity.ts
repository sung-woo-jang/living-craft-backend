import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';

export enum NotificationType {
  RESERVATION_CONFIRMED = 'reservation_confirmed',
  REMINDER = 'reminder',
  QUOTE_SENT = 'quote_sent',
  QUOTE_APPROVED = 'quote_approved',
  QUOTE_REJECTED = 'quote_rejected',
  SERVICE_COMPLETED = 'service_completed',
  REVIEW_REQUEST = 'review_request',
}

export enum NotificationChannel {
  SMS = 'sms',
  EMAIL = 'email',
}

@Entity('notification_templates')
@Index(['type', 'channel'], { unique: true })
export class NotificationTemplate extends BaseEntity {
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
    description: '제목 (이메일용)',
    example: '예약이 확정되었습니다',
    required: false,
  })
  @Column({ nullable: true })
  subject?: string;

  @ApiProperty({
    description: '내용 템플릿',
    example: '안녕하세요 {{customerName}}님, 예약번호 {{reservationCode}}가 확정되었습니다.',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    description: '활성화 상태',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  constructor(partial: Partial<NotificationTemplate> = {}) {
    super();
    Object.assign(this, partial);
  }
}
