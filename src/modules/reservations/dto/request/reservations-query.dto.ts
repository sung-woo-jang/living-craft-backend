import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ReservationStatus } from '../../entities';

export class ReservationsQueryDto {
  @ApiPropertyOptional({
    description: '예약 상태 필터',
    enum: ReservationStatus,
    example: ReservationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ReservationStatus, { message: '유효하지 않은 상태입니다.' })
  status?: ReservationStatus;

  @ApiPropertyOptional({
    description: '조회 개수',
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @ApiPropertyOptional({
    description: '건너뛸 개수',
    example: 0,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  offset?: number = 0;
}
