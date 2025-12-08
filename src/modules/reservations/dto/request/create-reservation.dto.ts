import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateReservationDto {
  @ApiProperty({
    description: '서비스 ID',
    example: '1',
  })
  @IsString({ message: 'serviceId는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'serviceId는 필수입니다.' })
  serviceId: string;

  @ApiProperty({
    description: '견적 날짜 (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsString({ message: 'estimateDate는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'estimateDate는 필수입니다.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'estimateDate 형식은 YYYY-MM-DD여야 합니다.',
  })
  estimateDate: string;

  @ApiProperty({
    description: '견적 시간 (HH:mm)',
    example: '18:00',
  })
  @IsString({ message: 'estimateTime은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'estimateTime은 필수입니다.' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'estimateTime 형식은 HH:mm이어야 합니다.',
  })
  estimateTime: string;

  @ApiProperty({
    description: '시공 날짜 (YYYY-MM-DD)',
    example: '2024-01-20',
  })
  @IsString({ message: 'constructionDate는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'constructionDate는 필수입니다.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'constructionDate 형식은 YYYY-MM-DD여야 합니다.',
  })
  constructionDate: string;

  @ApiPropertyOptional({
    description: '시공 시간 (HH:mm, 하루 종일이면 null)',
    example: '09:00',
  })
  @IsOptional()
  @IsString({ message: 'constructionTime은 문자열이어야 합니다.' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'constructionTime 형식은 HH:mm이어야 합니다.',
  })
  constructionTime?: string | null;

  @ApiProperty({
    description: '도로명 주소',
    example: '서울특별시 강남구 테헤란로 123',
  })
  @IsString({ message: 'address는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'address는 필수입니다.' })
  @MaxLength(500, { message: 'address는 500자를 초과할 수 없습니다.' })
  @Transform(({ value }) => value?.trim())
  address: string;

  @ApiProperty({
    description: '상세 주소',
    example: '2층 201호',
  })
  @IsString({ message: 'detailAddress는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'detailAddress는 필수입니다.' })
  @MaxLength(200, { message: 'detailAddress는 200자를 초과할 수 없습니다.' })
  @Transform(({ value }) => value?.trim())
  detailAddress: string;

  @ApiProperty({
    description: '고객 이름',
    example: '홍길동',
  })
  @IsString({ message: 'customerName은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'customerName은 필수입니다.' })
  @MaxLength(100, { message: 'customerName은 100자를 초과할 수 없습니다.' })
  @Transform(({ value }) => value?.trim())
  customerName: string;

  @ApiProperty({
    description: '고객 전화번호',
    example: '010-1234-5678',
  })
  @IsString({ message: 'customerPhone은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'customerPhone은 필수입니다.' })
  @MaxLength(20, { message: 'customerPhone은 20자를 초과할 수 없습니다.' })
  customerPhone: string;

  @ApiPropertyOptional({
    description: '메모',
    example: '주차 공간 없음',
  })
  @IsOptional()
  @IsString({ message: 'memo는 문자열이어야 합니다.' })
  @Transform(({ value }) => value?.trim())
  memo?: string;

  @ApiPropertyOptional({
    description: '첨부 사진 URL 목록',
    example: ['https://example.com/photo1.jpg'],
  })
  @IsOptional()
  @IsArray({ message: 'photos는 배열이어야 합니다.' })
  @IsString({ each: true, message: 'photos의 각 항목은 문자열이어야 합니다.' })
  photos?: string[];
}
