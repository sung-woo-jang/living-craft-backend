import { PartialType, OmitType } from '@nestjs/swagger';
import { UserBaseDto } from '../base/user-base.dto';

export class CreateUserDto extends PartialType(
  OmitType(UserBaseDto, ['isActive'] as const)
) {}
