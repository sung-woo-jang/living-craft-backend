import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TossReferrer {
  DEFAULT = 'DEFAULT',
  SANDBOX = 'SANDBOX',
}

export class LoginDto {
  @ApiProperty({
    description: '토스 앱에서 발급받은 인가 코드',
    example: 'auth_code_12345',
  })
  @IsString({ message: '인가 코드는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '인가 코드는 필수입니다.' })
  authorizationCode: string;

  @ApiProperty({
    description: '토스 환경 (DEFAULT: 운영, SANDBOX: 테스트)',
    enum: TossReferrer,
    example: TossReferrer.DEFAULT,
  })
  @IsEnum(TossReferrer, { message: 'referrer는 DEFAULT 또는 SANDBOX여야 합니다.' })
  @IsNotEmpty({ message: 'referrer는 필수입니다.' })
  referrer: TossReferrer;
}
