import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ChangePasswordRequestDto {
  @ApiProperty({
    description: '현재 비밀번호',
    example: 'currentPassword123!',
    minLength: 1,
    maxLength: 100,
  })
  @IsString({ message: '현재 비밀번호는 문자열이어야 합니다.' })
  @Transform(({ value }) => value?.trim())
  currentPassword: string;

  @ApiProperty({
    description: '새 비밀번호',
    example: 'newPassword123!',
    minLength: 8,
    maxLength: 100,
  })
  @IsString({ message: '새 비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '새 비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(100, { message: '새 비밀번호는 최대 100자까지 가능합니다.' })
  @Transform(({ value }) => value?.trim())
  newPassword: string;
}
