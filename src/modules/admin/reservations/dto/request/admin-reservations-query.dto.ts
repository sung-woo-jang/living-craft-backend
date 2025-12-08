import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminReservationsQueryDto {
  @ApiPropertyOptional({ description: '예약 상태 필터' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: '시작 날짜 (YYYY-MM-DD)' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate?: string;

  @ApiPropertyOptional({ description: '종료 날짜 (YYYY-MM-DD)' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate?: string;

  @ApiPropertyOptional({ description: '검색어 (이름, 전화번호)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '페이지 번호', default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: '페이지 당 항목 수', default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
