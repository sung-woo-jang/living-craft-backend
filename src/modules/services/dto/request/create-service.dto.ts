import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsNumber, 
  IsBoolean, 
  Min, 
  MinLength, 
  IsUrl 
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ServiceType } from '../../../../common/enums';

export class CreateServiceDto {
  @ApiProperty({ description: '서비스명', example: '청소 서비스' })
  @IsString({ message: '서비스명은 문자열이어야 합니다.' })
  @MinLength(2, { message: '서비스명은 2자 이상이어야 합니다.' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ 
    description: '서비스 설명', 
    example: '전문적인 청소 서비스를 제공합니다.' 
  })
  @IsString({ message: '서비스 설명은 문자열이어야 합니다.' })
  @MinLength(10, { message: '서비스 설명은 10자 이상이어야 합니다.' })
  @Transform(({ value }) => value?.trim())
  description: string;

  @ApiProperty({ 
    description: '서비스 타입', 
    enum: ServiceType, 
    example: ServiceType.FIXED 
  })
  @IsEnum(ServiceType, { message: '유효한 서비스 타입을 선택해주세요.' })
  type: ServiceType;

  @ApiPropertyOptional({ 
    description: '가격 (정찰제만)', 
    example: 100000,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '가격은 숫자여야 합니다.' })
  @Min(0, { message: '가격은 0 이상이어야 합니다.' })
  price?: number;

  @ApiProperty({ 
    description: '예상 소요시간 (분)', 
    example: 120,
    minimum: 1
  })
  @Type(() => Number)
  @IsNumber({}, { message: '소요시간은 숫자여야 합니다.' })
  @Min(1, { message: '소요시간은 1분 이상이어야 합니다.' })
  duration: number;

  @ApiPropertyOptional({ 
    description: '활성 상태', 
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: '활성 상태는 불린 값이어야 합니다.' })
  isActive?: boolean = true;

  @ApiPropertyOptional({ 
    description: '표시 순서', 
    example: 1,
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '표시 순서는 숫자여야 합니다.' })
  @Min(0, { message: '표시 순서는 0 이상이어야 합니다.' })
  displayOrder?: number = 0;

  @ApiPropertyOptional({ 
    description: '메인 이미지 URL', 
    example: '/uploads/services/main.jpg' 
  })
  @IsOptional()
  @IsString({ message: '메인 이미지 URL은 문자열이어야 합니다.' })
  @Transform(({ value }) => value?.trim())
  mainImageUrl?: string;

  @ApiPropertyOptional({ 
    description: '상세 내용 (HTML)', 
    example: '<p>상세한 서비스 설명</p>' 
  })
  @IsOptional()
  @IsString({ message: '상세 내용은 문자열이어야 합니다.' })
  detailContent?: string;
}
