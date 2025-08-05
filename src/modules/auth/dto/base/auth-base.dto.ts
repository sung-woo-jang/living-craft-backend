import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class AuthBaseDto {
  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'password123',
  })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(6, { message: '비밀번호는 6자 이상이어야 합니다.' })
  password: string;

  @ApiProperty({
    description: '이름',
    example: '홍길동',
  })
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @MinLength(2, { message: '이름은 2자 이상이어야 합니다.' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({
    description: '전화번호',
    example: '010-1234-5678',
  })
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @Transform(({ value }) => value?.replace(/[^0-9]/g, ''))
  phone: string;
}
