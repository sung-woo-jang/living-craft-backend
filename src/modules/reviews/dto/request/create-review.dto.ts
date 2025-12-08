import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({
    description: '예약 ID',
    example: '1',
  })
  @IsString({ message: 'reservationId는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'reservationId는 필수입니다.' })
  reservationId: string;

  @ApiProperty({
    description: '평점 (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber({}, { message: 'rating은 숫자여야 합니다.' })
  @Min(1, { message: 'rating은 1 이상이어야 합니다.' })
  @Max(5, { message: 'rating은 5 이하여야 합니다.' })
  rating: number;

  @ApiProperty({
    description: '리뷰 내용',
    example: '친절하고 깔끔하게 시공해주셨습니다.',
  })
  @IsString({ message: 'comment는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'comment는 필수입니다.' })
  @MaxLength(2000, { message: 'comment는 2000자를 초과할 수 없습니다.' })
  @Transform(({ value }) => value?.trim())
  comment: string;
}
