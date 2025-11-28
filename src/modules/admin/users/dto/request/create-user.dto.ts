import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@common/enums';

export class CreateUserDto {
  @ApiProperty({
    description: '이름',
    example: '홍',
  })
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @MaxLength(100, { message: '이름은 100자를 초과할 수 없습니다.' })
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({
    description: '성',
    example: '길동',
  })
  @IsString({ message: '성은 문자열이어야 합니다.' })
  @MaxLength(100, { message: '성은 100자를 초과할 수 없습니다.' })
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty({
    description: '사용자명',
    example: 'hong.gildong',
  })
  @IsString({ message: '사용자명은 문자열이어야 합니다.' })
  @MaxLength(100, { message: '사용자명은 100자를 초과할 수 없습니다.' })
  @Matches(/^[a-z0-9._-]+$/, {
    message: '사용자명은 소문자, 숫자, ., _, -만 사용할 수 있습니다.',
  })
  @Transform(({ value }) => value?.trim().toLowerCase())
  username: string;

  @ApiProperty({
    description: '이메일',
    example: 'hong@example.com',
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @MaxLength(255, { message: '이메일은 255자를 초과할 수 없습니다.' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({
    description: '비밀번호 (최소 8자)',
    example: 'Password123!',
  })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;

  @ApiPropertyOptional({
    description: '전화번호',
    example: '010-1234-5678',
  })
  @IsOptional()
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @MaxLength(20, { message: '전화번호는 20자를 초과할 수 없습니다.' })
  @Transform(({ value }) => value?.trim())
  phoneNumber?: string;

  @ApiProperty({
    description: '사용자 역할',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  @IsEnum(UserRole, { message: '올바른 역할을 선택해야 합니다.' })
  role: UserRole;

  @ApiPropertyOptional({
    description: '사용자 상태',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    default: UserStatus.INVITED,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: '올바른 상태를 선택해야 합니다.' })
  status?: UserStatus;
}
