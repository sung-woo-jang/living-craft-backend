import { ApiProperty } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { ServiceType } from '@common/enums';
import { Service } from '../../entities/service.entity';

export class ServiceResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: ServiceType })
  type: ServiceType;

  @ApiProperty({ nullable: true })
  price?: number;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor() {
    // 기본 생성자
  }

  static fromEntity(service: Service): ServiceResponseDto {
    return plainToClass(ServiceResponseDto, service, {
      excludeExtraneousValues: false,
    });
  }
}
