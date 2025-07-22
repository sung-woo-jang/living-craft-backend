import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile extends BaseEntity {
  @ApiProperty({ description: '사용자 ID' })
  @Column()
  userId: number;

  @ApiProperty({ description: '주소', required: false })
  @Column({ nullable: true })
  address?: string;

  @ApiProperty({ description: '마케팅 수신 동의', example: false })
  @Column({ default: false })
  marketingAgree: boolean;

  @ApiProperty({ description: '총 예약 횟수', example: 5 })
  @Column({ default: 0 })
  totalReservations: number;

  @ApiProperty({ description: '마지막 예약일', required: false })
  @Column({ type: 'timestamp', nullable: true })
  lastReservationAt?: Date;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;
}
