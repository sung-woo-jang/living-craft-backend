import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePortfolioDto {
  @ApiProperty({ description: '카테고리', example: '인테리어필름' })
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  category: string;

  @ApiProperty({
    description: '프로젝트명',
    example: '강남 카페 인테리어',
  })
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  projectName: string;

  @ApiPropertyOptional({ description: '고객사', example: '카페 이름' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  client?: string;

  @ApiProperty({ description: '작업 기간', example: '2일' })
  @IsString()
  @MaxLength(50)
  duration: string;

  @ApiProperty({
    description: '간단 설명',
    example: '모던한 분위기의 카페 인테리어 필름 시공',
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  description: string;

  @ApiProperty({
    description: '상세 설명',
    example:
      '모던한 분위기의 카페 인테리어 필름 시공 작업입니다. 대리석 패턴의 필름을 적용하여 고급스러운 느낌을 연출했습니다.',
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  detailedDescription: string;

  @ApiProperty({
    description: '이미지 URL 배열',
    example: [
      'https://example.com/images/portfolio1-1.jpg',
      'https://example.com/images/portfolio1-2.jpg',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiPropertyOptional({
    description: '태그 배열',
    example: ['카페', '모던', '인테리어필름'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: '관련 서비스 ID', example: 1 })
  @IsNumber()
  relatedServiceId: number;
}
