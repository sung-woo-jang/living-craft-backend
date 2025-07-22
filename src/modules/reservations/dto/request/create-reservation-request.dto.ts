import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsNumber, 
  IsDateString,
  Matches,
  Length 
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationRequestDto {
  @ApiProperty({
    description: '서비스 ID',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber({}, { message: '올바른 서비스 ID를 입력해주세요.' })
  serviceId: number;

  @ApiProperty({
    description: '고객명',
    example: '홍길동',
  })
  @IsNotEmpty({ message: '고객명을 입력해주세요.' })
  @IsString()
  @Length(2, 50, { message: '고객명은 2자 이상 50자 이하여야 합니다.' })
  customerName: string;

  @ApiProperty({
    description: '고객 전화번호',
    example: '010-1234-5678',
  })
  @IsNotEmpty({ message: '전화번호를 입력해주세요.' })
  @IsString()
  customerPhone: string;

  @ApiProperty({
    description: '고객 이메일',
    example: 'customer@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  customerEmail?: string;

  @ApiProperty({
    description: '서비스 받을 주소',
    example: '서울시 강남구 테헤란로 123',
  })
  @IsNotEmpty({ message: '서비스 주소를 입력해주세요.' })
  @IsString()
  serviceAddress: string;

  @ApiProperty({
    description: '서비스 날짜',
    example: '2024-01-15',
  })
  @IsNotEmpty({ message: '서비스 날짜를 입력해주세요.' })
  @IsDateString({}, { message: '올바른 날짜 형식이 아닙니다.' })
  serviceDate: string;

  @ApiProperty({
    description: '서비스 시간',
    example: '14:00',
  })
  @IsNotEmpty({ message: '서비스 시간을 입력해주세요.' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: '올바른 시간 형식이 아닙니다.' })
  serviceTime: string;

  @ApiProperty({
    description: '요청사항',
    example: '반려동물이 있습니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  requestNote?: string;
}
