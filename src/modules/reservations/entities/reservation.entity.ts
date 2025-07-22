import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';
import { ReservationStatus } from '@common/enums';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { Quote } from '../../quotes/entities/quote.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('reservations')
@Index(['reservationCode'], { unique: true })
@Index(['status', 'serviceDate'])
@Index(['customerPhone'])
export class Reservation extends BaseEntity {
  @ApiProperty({
    description: '예약번호',
    example: '20240101-0001',
  })
  @Column({ unique: true, length: 13 })
  reservationCode: string;

  @ApiProperty({
    description: '예약 상태',
    enum: ReservationStatus,
    example: ReservationStatus.CONFIRMED,
  })
  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  // 고객 정보 (비회원도 가능하므로 직접 저장)
  @ApiProperty({
    description: '고객명',
    example: '홍길동',
  })
  @Column({ length: 50 })
  customerName: string;

  @ApiProperty({
    description: '고객 전화번호',
    example: '010-1234-5678',
  })
  @Column({ length: 20 })
  customerPhone: string;

  @ApiProperty({
    description: '고객 이메일',
    example: 'customer@example.com',
    required: false,
  })
  @Column({ nullable: true })
  customerEmail?: string;

  // 서비스 정보
  @ApiProperty({
    description: '서비스 받을 주소',
    example: '서울시 강남구 테헤란로 123',
  })
  @Column({ type: 'text' })
  serviceAddress: string;

  @ApiProperty({
    description: '서비스 날짜',
    example: '2024-01-15',
  })
  @Column({ type: 'date' })
  serviceDate: Date;

  @ApiProperty({
    description: '서비스 시간',
    example: '14:00',
  })
  @Column({ type: 'time' })
  serviceTime: string;

  @ApiProperty({
    description: '요청사항',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  requestNote?: string;

  @ApiProperty({
    description: '총 가격',
    example: 50000,
    required: false,
  })
  @Column({ nullable: true })
  totalPrice?: number;

  @ApiProperty({
    description: '결제 완료 여부',
    example: false,
  })
  @Column({ default: false })
  isPaid: boolean;

  // Relations
  @ManyToOne(() => User, (user) => user.reservations, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ nullable: true })
  userId?: number;

  @ManyToOne(() => Service, (service) => service.reservations)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column()
  serviceId: number;

  @OneToOne(() => Quote, (quote) => quote.reservation, { cascade: true })
  quote?: Quote;

  @OneToOne(() => Review, (review) => review.reservation)
  review?: Review;

  constructor(partial: Partial<Reservation> = {}) {
    super();
    Object.assign(this, partial);
  }
}
