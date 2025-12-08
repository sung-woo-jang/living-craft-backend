import { IsString, IsNotEmpty, IsEnum, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TimeType {
  ESTIMATE = 'estimate',
  CONSTRUCTION = 'construction',
}

export class AvailableTimesDto {
  @ApiProperty({
    description: '서비스 ID',
    example: '1',
  })
  @IsString({ message: 'serviceId는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'serviceId는 필수입니다.' })
  serviceId: string;

  @ApiProperty({
    description: '조회 날짜 (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsString({ message: 'date는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'date는 필수입니다.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date 형식은 YYYY-MM-DD여야 합니다.',
  })
  date: string;

  @ApiProperty({
    description: '시간 타입 (견적/시공)',
    enum: TimeType,
    example: TimeType.ESTIMATE,
  })
  @IsEnum(TimeType, { message: 'type은 estimate 또는 construction이어야 합니다.' })
  @IsNotEmpty({ message: 'type은 필수입니다.' })
  type: TimeType;
}
