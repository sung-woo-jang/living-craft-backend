import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';
import { OAuthProvider } from '../../../common/enums';
import { User } from './user.entity';

@Entity('oauth_accounts')
export class OAuthAccount extends BaseEntity {
  @ApiProperty({ description: '사용자 ID' })
  @Column()
  userId: number;

  @ApiProperty({ description: 'OAuth 제공자', enum: OAuthProvider })
  @Column({
    type: 'enum',
    enum: OAuthProvider,
  })
  provider: OAuthProvider;

  @ApiProperty({ description: '제공자 사용자 ID' })
  @Column()
  providerId: string;

  @ApiProperty({ description: '액세스 토큰' })
  @Column({ type: 'text', nullable: true })
  accessToken?: string;

  @ApiProperty({ description: '리프레시 토큰' })
  @Column({ type: 'text', nullable: true })
  refreshToken?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
