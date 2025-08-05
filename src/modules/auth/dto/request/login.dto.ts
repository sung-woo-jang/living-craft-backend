import { PickType } from '@nestjs/swagger';
import { AuthBaseDto } from '../base/auth-base.dto';

export class LoginDto extends PickType(AuthBaseDto, [
  'email',
  'password',
] as const) {}
