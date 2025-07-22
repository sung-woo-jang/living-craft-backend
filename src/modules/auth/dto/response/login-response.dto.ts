import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    description: '토큰 타입',
    example: 'Bearer',
  })
  @Expose()
  tokenType: string = 'Bearer';

  @ApiProperty({
    description: '토큰 만료 시간 (초)',
    example: 86400,
  })
  @Expose()
  expiresIn: number;

  @ApiProperty({
    description: '사용자 정보',
  })
  @Expose()
  user: {
    id: number;
    email?: string;
    name: string;
    role: string;
  };

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}
