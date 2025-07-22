import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyGuestRequestDto {
  @ApiProperty({
    description: '예약번호',
    example: '20240101-0001',
  })
  @IsNotEmpty({ message: '예약번호를 입력해주세요.' })
  @IsString()
  @Matches(/^\d{8}-\d{4}$/, { message: '올바른 예약번호 형식이 아닙니다.' })
  reservationCode: string;

  @ApiProperty({
    description: '전화번호',
    example: '010-1234-5678',
  })
  @IsNotEmpty({ message: '전화번호를 입력해주세요.' })
  @IsString()
  phone: string;
}
