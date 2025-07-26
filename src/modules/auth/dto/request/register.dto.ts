import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { AuthBaseDto } from '../base/auth-base.dto';

export class RegisterDto extends PartialType(
  OmitType(AuthBaseDto, ['phone'] as const)
) {
  @ApiPropertyOptional({
    description: '전화번호',
    example: '010-1234-5678',
  })
  @IsOptional()
  phone?: string;
}
