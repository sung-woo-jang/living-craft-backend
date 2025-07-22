import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceType } from '@common/enums';

export class CreateServiceRequestDto {
  @ApiProperty({
    description: '서비스명',
    example: '일반 청소',
  })
  @IsNotEmpty({ message: '서비스명을 입력해주세요.' })
  @IsString()
  name: string;

  @ApiProperty({
    description: '서비스 설명',
    example: '일반적인 집 청소 서비스입니다.',
  })
  @IsNotEmpty({ message: '서비스 설명을 입력해주세요.' })
  @IsString()
  description: string;

  @ApiProperty({
    description: '서비스 타입',
    enum: ServiceType,
    example: ServiceType.FIXED,
  })
  @IsEnum(ServiceType, { message: '올바른 서비스 타입을 선택해주세요.' })
  type: ServiceType;

  @ApiProperty({
    description: '가격 (정찰제만)',
    example: 50000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '올바른 가격을 입력해주세요.' })
  @Min(0, { message: '가격은 0 이상이어야 합니다.' })
  price?: number;

  @ApiProperty({
    description: '예상 소요시간 (분)',
    example: 120,
  })
  @Type(() => Number)
  @IsNumber({}, { message: '올바른 소요시간을 입력해주세요.' })
  @Min(30, { message: '소요시간은 최소 30분 이상이어야 합니다.' })
  @Max(720, { message: '소요시간은 최대 720분(12시간) 이하여야 합니다.' })
  duration: number;

  @ApiProperty({
    description: '표시 순서',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '올바른 표시 순서를 입력해주세요.' })
  @Min(0, { message: '표시 순서는 0 이상이어야 합니다.' })
  displayOrder?: number;
}
