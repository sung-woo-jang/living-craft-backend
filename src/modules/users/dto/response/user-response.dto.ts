import { ApiProperty } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { UserRole } from '@common/enums';
import { User } from '../../entities/user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ nullable: true })
  email?: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor() {
    // 기본 생성자
  }

  static fromEntity(user: User): UserResponseDto {
    return plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: false,
    });
  }
}
