import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '이름', example: '홍길동' })
  @IsOptional()
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @MinLength(2, { message: '이름은 2자 이상이어야 합니다.' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({ description: '전화번호', example: '010-1234-5678' })
  @IsOptional()
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @Transform(({ value }) => value?.replace(/[^0-9]/g, ''))
  phone?: string;

  @ApiPropertyOptional({ description: '활성 상태', example: true })
  @IsOptional()
  @IsBoolean({ message: '활성 상태는 불린 값이어야 합니다.' })
  isActive?: boolean;
}
