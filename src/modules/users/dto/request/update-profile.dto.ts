import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: '주소', example: '서울시 강남구 테헤란로 123' })
  @IsOptional()
  @IsString({ message: '주소는 문자열이어야 합니다.' })
  @Transform(({ value }) => value?.trim())
  address?: string;

  @ApiPropertyOptional({ description: '마케팅 수신 동의', example: true })
  @IsOptional()
  @IsBoolean({ message: '마케팅 수신 동의는 불린 값이어야 합니다.' })
  marketingAgree?: boolean;
}
