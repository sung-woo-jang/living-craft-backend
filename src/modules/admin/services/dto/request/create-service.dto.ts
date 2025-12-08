import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  MaxLength,
  IsNumber,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ServiceRegionDto {
  @ApiProperty({ description: '지역 ID' })
  @IsNumber()
  regionId: number;

  @ApiProperty({ description: '도시 ID 목록', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  cityIds: number[];
}

export class CreateServiceDto {
  @ApiProperty({ description: '서비스 제목', example: '인테리어 필름' })
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiProperty({
    description: '서비스 설명',
    example: '고급 인테리어 필름 시공 서비스입니다.',
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  description: string;

  @ApiProperty({ description: 'TDS 아이콘 이름', example: 'ic_home_fill_24' })
  @IsString()
  @MaxLength(100)
  iconName: string;

  @ApiProperty({ description: '아이콘 배경색 (HEX)', example: '#E3F2FD' })
  @IsString()
  @MaxLength(10)
  iconBgColor: string;

  @ApiProperty({ description: '작업 소요 시간', example: '하루 종일' })
  @IsString()
  @MaxLength(50)
  duration: string;

  @ApiProperty({
    description: '시공 시간 선택 필요 여부',
    example: false,
  })
  @IsBoolean()
  requiresTimeSelection: boolean;

  @ApiPropertyOptional({
    description: '서비스 가능 지역 설정',
    type: [ServiceRegionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceRegionDto)
  serviceableRegions?: ServiceRegionDto[];
}
