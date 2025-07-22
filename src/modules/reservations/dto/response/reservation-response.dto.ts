import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type, plainToClass } from 'class-transformer';
import { ReservationStatus } from '@common/enums';
import { ServiceResponseDto } from '../../../services/dto/response/service-response.dto';
import { UserResponseDto } from '../../../users/dto/response/user-response.dto';
import { Reservation } from '../../entities/reservation.entity';

export class ReservationResponseDto {
  @ApiProperty({
    description: 'ID',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: '예약번호',
    example: '20240101-0001',
  })
  @Expose()
  reservationCode: string;

  @ApiProperty({
    description: '예약 상태',
    enum: ReservationStatus,
    example: ReservationStatus.CONFIRMED,
  })
  @Expose()
  status: ReservationStatus;

  @ApiProperty({
    description: '고객명',
    example: '홍길동',
  })
  @Expose()
  customerName: string;

  @ApiProperty({
    description: '고객 전화번호',
    example: '010-****-5678',
  })
  @Expose()
  customerPhone: string;

  @ApiProperty({
    description: '고객 이메일',
    example: 'customer@example.com',
    required: false,
  })
  @Expose()
  customerEmail?: string;

  @ApiProperty({
    description: '서비스 받을 주소',
    example: '서울시 강남구 테헤란로 123',
  })
  @Expose()
  serviceAddress: string;

  @ApiProperty({
    description: '서비스 날짜',
    example: '2024-01-15',
  })
  @Expose()
  serviceDate: Date;

  @ApiProperty({
    description: '서비스 시간',
    example: '14:00',
  })
  @Expose()
  serviceTime: string;

  @ApiProperty({
    description: '요청사항',
    required: false,
  })
  @Expose()
  requestNote?: string;

  @ApiProperty({
    description: '총 가격',
    example: 50000,
    required: false,
  })
  @Expose()
  totalPrice?: number;

  @ApiProperty({
    description: '결제 완료 여부',
    example: false,
  })
  @Expose()
  isPaid: boolean;

  @ApiProperty({
    description: '서비스 정보',
    type: ServiceResponseDto,
  })
  @Expose()
  @Type(() => ServiceResponseDto)
  service: ServiceResponseDto;

  @ApiProperty({
    description: '사용자 정보 (회원인 경우)',
    type: UserResponseDto,
    required: false,
  })
  @Expose()
  @Type(() => UserResponseDto)
  user?: UserResponseDto;

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

  constructor(partial: Partial<ReservationResponseDto> = {}) {
    Object.assign(this, partial);
  }

  static fromEntity(reservation: Reservation): ReservationResponseDto {
    return plainToClass(
      ReservationResponseDto,
      {
        ...reservation,
        service: reservation.service
          ? plainToClass(ServiceResponseDto, reservation.service)
          : undefined,
        user: reservation.user
          ? plainToClass(UserResponseDto, reservation.user)
          : undefined,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
