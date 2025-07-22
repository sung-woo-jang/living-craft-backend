import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyReservationDto {
  @ApiProperty({ 
    description: '예약번호', 
    example: '20241201-0001',
    pattern: '^\\d{8}-\\d{4}$'
  })
  @IsString({ message: '예약번호는 문자열이어야 합니다.' })
  @Matches(/^\d{8}-\d{4}$/, { 
    message: '예약번호는 YYYYMMDD-0000 형식이어야 합니다.' 
  })
  @Transform(({ value }) => value?.trim())
  reservationCode: string;

  @ApiProperty({ 
    description: '전화번호', 
    example: '010-1234-5678' 
  })
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @Transform(({ value }) => value?.replace(/[^0-9]/g, ''))
  @MinLength(10, { message: '전화번호는 10자리 이상이어야 합니다.' })
  @MaxLength(11, { message: '전화번호는 11자리 이하여야 합니다.' })
  phone: string;
}
