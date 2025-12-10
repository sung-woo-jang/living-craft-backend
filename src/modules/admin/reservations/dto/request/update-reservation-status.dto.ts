import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ERROR_MESSAGES, FIELD_NAMES } from '@common/constants';

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
    message: ERROR_MESSAGES.VALIDATION.INVALID_ENUM(
      FIELD_NAMES.status,
      Object.values(AdminReservationStatusUpdate).join(', '),
    ),
  })
  status: AdminReservationStatusUpdate;
}
