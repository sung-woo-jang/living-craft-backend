import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '@common/entities/base.entity';
import { OAuthProvider } from '@common/enums';
import { User } from './user.entity';

@Entity('oauth_accounts')
@Index(['provider', 'providerId'], { unique: true })
export class OAuthAccount extends BaseEntity {
  @ApiProperty({
    description: 'OAuth 제공자',
    enum: OAuthProvider,
    example: OAuthProvider.NAVER,
  })
  @Column({
    type: 'enum',
    enum: OAuthProvider,
  })
  provider: OAuthProvider;

  @ApiProperty({
    description: 'OAuth 제공자 고유 ID',
    example: 'naver_user_123456',
  })
  @Column()
  providerId: string;

  @ApiProperty({
    description: '액세스 토큰',
    required: false,
  })
  @Column({ nullable: true })
  @Exclude()
  accessToken?: string;

  @ApiProperty({
    description: '리프레시 토큰',
    required: false,
  })
  @Column({ nullable: true })
  @Exclude()
  refreshToken?: string;

  // Relations
  @ManyToOne(() => User, (user) => user.oauthAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  constructor(partial: Partial<OAuthAccount> = {}) {
    super();
    Object.assign(this, partial);
  }
}
