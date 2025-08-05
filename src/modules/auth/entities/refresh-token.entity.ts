import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
@Index(['token'], { unique: true })
@Index(['userId'])
export class RefreshToken extends BaseEntity {
  @Column({ length: 255, unique: true })
  token: string;

  @Column()
  userId: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ nullable: true })
  revokedAt?: Date;

  @Column({ nullable: true })
  revokedReason?: string;

  // 토큰이 사용된 클라이언트 정보 (선택적)
  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  constructor(partial: Partial<RefreshToken> = {}) {
    super();
    Object.assign(this, partial);
  }
}
