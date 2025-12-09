import {
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  IsOptional,
  MaxLength,
  Min,
  ArrayMinSize,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 서비스 지역 입력 DTO
 */
export class ServiceRegionInputDto {
  @ApiProperty({
    description: '지역 ID (District ID)',
    example: 1,
  })
  @IsNumber({}, { message: '지역 ID는 숫자여야 합니다.' })
  @Min(1, { message: '지역 ID는 1 이상이어야 합니다.' })
  districtId: number;

  @ApiProperty({
    description: '출장비 (원)',
    example: 10000,
  })
  @IsNumber({}, { message: '출장비는 숫자여야 합니다.' })
  @Min(0, { message: '출장비는 0 이상이어야 합니다.' })
  estimateFee: number;
}

/**
 * 서비스 생성 DTO
 */
export class CreateServiceDto {
  @ApiProperty({
    description: '서비스명',
    example: '인테리어 필름',
    maxLength: 100,
  })
  @IsString({ message: '서비스명은 문자열이어야 합니다.' })
  @MaxLength(100, { message: '서비스명은 100자를 초과할 수 없습니다.' })
  title: string;

  @ApiProperty({
    description: '서비스 설명',
    example: '고급 인테리어 필름 시공 서비스입니다.',
  })
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  description: string;

  @ApiProperty({
    description: 'TDS 아이콘 이름',
    example: 'ic_home_fill_24',
  })
  @IsString({ message: '아이콘 이름은 문자열이어야 합니다.' })
  iconName: string;

  @ApiProperty({
    description: '아이콘 배경색 (HEX 색상 코드)',
    example: '#E3F2FD',
  })
  @IsString({ message: '배경색은 문자열이어야 합니다.' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: '유효한 HEX 색상 코드를 입력해주세요. (예: #E3F2FD)',
  })
  iconBgColor: string;

  @ApiProperty({
    description: '작업 소요 시간',
    example: '하루 종일',
  })
  @IsString({ message: '소요 시간은 문자열이어야 합니다.' })
  duration: string;

  @ApiProperty({
    description: '시공 시간 선택 필요 여부',
    example: false,
  })
  @IsBoolean({ message: '시간 선택 필요 여부는 boolean이어야 합니다.' })
  requiresTimeSelection: boolean;

  @ApiPropertyOptional({
    description: '정렬 순서 (낮을수록 먼저 표시)',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: '정렬 순서는 숫자여야 합니다.' })
  @Min(0, { message: '정렬 순서는 0 이상이어야 합니다.' })
  sortOrder?: number;

  @ApiProperty({
    description: '서비스 가능 지역 목록',
    type: [ServiceRegionInputDto],
  })
  @IsArray({ message: '지역 목록은 배열이어야 합니다.' })
  @ArrayMinSize(1, { message: '최소 1개 이상의 지역을 선택해야 합니다.' })
  @ValidateNested({ each: true })
  @Type(() => ServiceRegionInputDto)
  regions: ServiceRegionInputDto[];
}
