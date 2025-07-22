import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserRole } from '@common/enums';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
    required: false,
  })
  @Expose()
  email?: string;

  @ApiProperty({
    description: '이름',
    example: '홍길동',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: '전화번호 (마스킹)',
    example: '010-****-5678',
  })
  @Expose()
  phone: string;

  @ApiProperty({
    description: '사용자 역할',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  @Expose()
  role: UserRole;

  @ApiProperty({
    description: '주소',
    required: false,
  })
  @Expose()
  address?: string;

  @ApiProperty({
    description: '마케팅 수신 동의',
    example: false,
  })
  @Expose()
  marketingAgree: boolean;

  @ApiProperty({
    description: '총 예약 건수',
    example: 5,
  })
  @Expose()
  totalReservations: number;

  @ApiProperty({
    description: '마지막 예약일',
    required: false,
  })
  @Expose()
  lastReservationAt?: Date;

  @ApiProperty({
    description: '생성일시',
  })
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
