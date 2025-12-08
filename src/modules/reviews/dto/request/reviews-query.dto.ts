import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ReviewsQueryDto {
  @ApiPropertyOptional({
    description: '평점 필터 (1-5)',
    example: 5,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber({}, { message: 'rating은 숫자여야 합니다.' })
  @Min(1, { message: 'rating은 1 이상이어야 합니다.' })
  @Max(5, { message: 'rating은 5 이하여야 합니다.' })
  rating?: number;

  @ApiPropertyOptional({
    description: '서비스 ID 필터',
    example: '1',
  })
  @IsOptional()
  @IsString({ message: 'serviceId는 문자열이어야 합니다.' })
  serviceId?: string;

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
