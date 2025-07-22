import { Entity, Column, ManyToOne, OneToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity('reviews')
@Index(['rating'])
@Index(['isActive'])
export class Review extends BaseEntity {
  @ApiProperty({
    description: '평점 (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @Column()
  rating: number;

  @ApiProperty({
    description: '리뷰 내용',
    example: '서비스가 매우 만족스러웠습니다.',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    description: '리뷰 이미지 목록',
    type: [String],
    required: false,
  })
  @Column({ type: 'json', nullable: true })
  images?: string[];

  @ApiProperty({
    description: '관리자 답글',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  adminReply?: string;

  @ApiProperty({
    description: '활성화 상태 (관리자가 비활성화 가능)',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: '관리자 답글 작성일',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  adminReplyAt?: Date;

  // Relations
  @ManyToOne(() => User, user => user.reviews, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ nullable: true })
  userId?: number;

  @OneToOne(() => Reservation, reservation => reservation.review, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservation;

  @Column({ unique: true })
  reservationId: number;

  constructor(partial: Partial<Review> = {}) {
    super();
    Object.assign(this, partial);
  }
}
