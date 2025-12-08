import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum AdminReservationStatusUpdate {
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class UpdateReservationStatusDto {
  @ApiProperty({
    description: '변경할 예약 상태',
    enum: AdminReservationStatusUpdate,
    example: 'confirmed',
  })
  @IsEnum(AdminReservationStatusUpdate, {
    message: '유효한 예약 상태를 입력해주세요.',
  })
  status: AdminReservationStatusUpdate;
}
