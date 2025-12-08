import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminCustomersQueryDto {
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
