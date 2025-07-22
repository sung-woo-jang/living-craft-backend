import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ServiceType } from '@common/enums';

export class ServiceImageResponseDto {
  @ApiProperty({
    description: 'ID',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: '이미지 URL',
    example: '/uploads/services/image.jpg',
  })
  @Expose()
  imageUrl: string;

  @ApiProperty({
    description: '메인 이미지 여부',
    example: true,
  })
  @Expose()
  isMain: boolean;

  @ApiProperty({
    description: '표시 순서',
    example: 1,
  })
  @Expose()
  displayOrder: number;

  constructor(partial: Partial<ServiceImageResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ServiceResponseDto {
  @ApiProperty({
    description: 'ID',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: '서비스명',
    example: '일반 청소',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: '서비스 설명',
    example: '일반적인 집 청소 서비스입니다.',
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: '서비스 타입',
    enum: ServiceType,
    example: ServiceType.FIXED,
  })
  @Expose()
  type: ServiceType;

  @ApiProperty({
    description: '가격 (정찰제만)',
    example: 50000,
    required: false,
  })
  @Expose()
  price?: number;

  @ApiProperty({
    description: '예상 소요시간 (분)',
    example: 120,
  })
  @Expose()
  duration: number;

  @ApiProperty({
    description: '활성화 상태',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: '표시 순서',
    example: 1,
  })
  @Expose()
  displayOrder: number;

  @ApiProperty({
    description: '서비스 이미지 목록',
    type: [ServiceImageResponseDto],
  })
  @Expose()
  @Type(() => ServiceImageResponseDto)
  images: ServiceImageResponseDto[];

  @ApiProperty({
    description: '생성일시',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ServiceResponseDto>) {
    Object.assign(this, partial);
  }
}
