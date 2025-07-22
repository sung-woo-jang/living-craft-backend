import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ProfileResponseDto {
  @ApiProperty({ description: 'ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: '사용자 ID', example: 1 })
  @Expose()
  userId: number;

  @ApiProperty({ description: '주소', example: '서울시 강남구 테헤란로 123' })
  @Expose()
  address?: string;

  @ApiProperty({ description: '마케팅 수신 동의', example: false })
  @Expose()
  marketingAgree: boolean;

  @ApiProperty({ description: '총 예약 횟수', example: 5 })
  @Expose()
  totalReservations: number;

  @ApiProperty({ description: '마지막 예약일' })
  @Expose()
  @Type(() => Date)
  lastReservationAt?: Date;

  @ApiProperty({ description: '생성일시' })
  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  constructor(partial: Partial<ProfileResponseDto>) {
    Object.assign(this, partial);
  }
}
