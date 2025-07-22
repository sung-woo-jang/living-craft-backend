import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '@common/entities/base.entity';
import { UserRole } from '@common/enums';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('users')
@Index(['email'], { unique: true, where: 'email IS NOT NULL' })
export class User extends BaseEntity {
  @ApiProperty({
    description: '이메일 (네이버 OAuth)',
    example: 'user@example.com',
    required: false,
  })
  @Column({ nullable: true, unique: true })
  email?: string;

  @ApiProperty({
    description: '이름',
    example: '홍길동',
  })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({
    description: '전화번호',
    example: '010-1234-5678',
  })
  @Column({ length: 20 })
  phone: string;

  @ApiProperty({
    description: '사용자 역할',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @ApiProperty({
    description: '활성화 상태',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  // OAuth 정보
  @ApiProperty({
    description: '네이버 고유 ID',
    required: false,
  })
  @Column({ nullable: true })
  @Exclude()
  naverId?: string;

  // 고객 추가 정보
  @ApiProperty({
    description: '주소',
    required: false,
  })
  @Column({ nullable: true })
  address?: string;

  @ApiProperty({
    description: '마케팅 수신 동의',
    example: false,
  })
  @Column({ default: false })
  marketingAgree: boolean;

  @ApiProperty({
    description: '총 예약 건수',
    example: 5,
  })
  @Column({ default: 0 })
  totalReservations: number;

  @ApiProperty({
    description: '마지막 예약일',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  lastReservationAt?: Date;

  // Relations
  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  constructor(partial: Partial<User> = {}) {
    super();
    Object.assign(this, partial);
  }
}
