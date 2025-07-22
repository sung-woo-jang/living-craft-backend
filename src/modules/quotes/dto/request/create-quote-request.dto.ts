import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsDateString,
  Matches,
  Min 
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuoteRequestDto {
  @ApiProperty({
    description: '견적 가격',
    example: 80000,
  })
  @Type(() => Number)
  @IsNumber({}, { message: '올바른 가격을 입력해주세요.' })
  @Min(0, { message: '가격은 0 이상이어야 합니다.' })
  quotedPrice: number;

  @ApiProperty({
    description: '견적 제안 날짜',
    example: '2024-01-15',
  })
  @IsNotEmpty({ message: '견적 날짜를 입력해주세요.' })
  @IsDateString({}, { message: '올바른 날짜 형식이 아닙니다.' })
  quotedDate: string;

  @ApiProperty({
    description: '견적 제안 시간',
    example: '14:00',
  })
  @IsNotEmpty({ message: '견적 시간을 입력해주세요.' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: '올바른 시간 형식이 아닙니다.' })
  quotedTime: string;

  @ApiProperty({
    description: '예상 소요시간 (분)',
    example: 180,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '올바른 소요시간을 입력해주세요.' })
  @Min(30, { message: '소요시간은 최소 30분 이상이어야 합니다.' })
  quotedDuration?: number;

  @ApiProperty({
    description: '견적 설명',
    example: '추가 작업이 필요하여 견적이 상향 조정되었습니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
