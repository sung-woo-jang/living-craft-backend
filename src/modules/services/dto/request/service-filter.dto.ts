import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ServiceType } from '@common/enums';
import { PaginationRequestDto } from '@common/dto/request/pagination-request.dto';

export class ServiceFilterDto extends PaginationRequestDto {
  @ApiPropertyOptional({
    description: '서비스 타입',
    enum: ServiceType,
  })
  @IsOptional()
  @IsEnum(ServiceType, { message: '유효한 서비스 타입을 선택해주세요.' })
  type?: ServiceType;

  @ApiPropertyOptional({
    description: '활성 상태',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: '활성 상태는 불린 값이어야 합니다.' })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: '검색 키워드 (서비스명, 설명)',
    example: '청소',
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  search?: string;
}
