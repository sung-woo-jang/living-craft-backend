import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminReviewsQueryDto {
  @ApiPropertyOptional({ description: '평점 필터 (1-5)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ description: '서비스 ID 필터' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  serviceId?: number;

  @ApiPropertyOptional({ description: '페이지 번호', default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: '페이지 당 항목 수', default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
