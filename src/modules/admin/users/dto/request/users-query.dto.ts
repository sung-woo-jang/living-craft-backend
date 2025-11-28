import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationRequestDto } from '@common/dto/request/pagination-request.dto';
import { UserRole, UserStatus } from '@common/enums';

export class UsersQueryDto extends PaginationRequestDto {
  @ApiPropertyOptional({
    description: '검색어 (이름, 이메일, 사용자명)',
    example: 'hong',
  })
  @IsOptional()
  @IsString({ message: '검색어는 문자열이어야 합니다.' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: '역할 필터',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: '올바른 역할을 선택해야 합니다.' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: '상태 필터',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: '올바른 상태를 선택해야 합니다.' })
  status?: UserStatus;
}
