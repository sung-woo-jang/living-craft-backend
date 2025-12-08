import { IsString, IsNotEmpty, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddHolidayDto {
  @ApiProperty({
    description: '휴무일 (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsString({ message: 'date는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'date는 필수입니다.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '날짜 형식은 YYYY-MM-DD여야 합니다.',
  })
  date: string;

  @ApiProperty({
    description: '휴무 사유',
    example: '신정',
  })
  @IsString({ message: 'reason은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'reason은 필수입니다.' })
  @MaxLength(200, { message: 'reason은 200자를 초과할 수 없습니다.' })
  reason: string;
}
