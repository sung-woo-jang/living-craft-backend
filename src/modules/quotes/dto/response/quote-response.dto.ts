import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { QuoteStatus } from '@common/enums';

export class QuoteResponseDto {
  @ApiProperty({
    description: 'ID',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: '견적 가격',
    example: 80000,
    required: false,
  })
  @Expose()
  quotedPrice?: number;

  @ApiProperty({
    description: '견적 제안 날짜',
    example: '2024-01-15',
    required: false,
  })
  @Expose()
  quotedDate?: Date;

  @ApiProperty({
    description: '견적 제안 시간',
    example: '14:00',
    required: false,
  })
  @Expose()
  quotedTime?: string;

  @ApiProperty({
    description: '예상 소요시간 (분)',
    example: 180,
    required: false,
  })
  @Expose()
  quotedDuration?: number;

  @ApiProperty({
    description: '견적 설명',
    required: false,
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: '견적 상태',
    enum: QuoteStatus,
    example: QuoteStatus.SENT,
  })
  @Expose()
  status: QuoteStatus;

  @ApiProperty({
    description: '거절 사유',
    required: false,
  })
  @Expose()
  rejectedReason?: string;

  @ApiProperty({
    description: '예약 ID',
    example: 1,
  })
  @Expose()
  reservationId: number;

  @ApiProperty({
    description: '생성일시',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<QuoteResponseDto>) {
    Object.assign(this, partial);
  }
}
