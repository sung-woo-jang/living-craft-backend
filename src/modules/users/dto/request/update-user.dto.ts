import { PartialType, OmitType } from '@nestjs/swagger';
import { UserBaseDto } from '../base/user-base.dto';

export class UpdateUserDto extends PartialType(
  OmitType(UserBaseDto, ['email', 'password'] as const)
) {}
