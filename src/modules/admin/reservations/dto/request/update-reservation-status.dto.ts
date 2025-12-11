import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ERROR_MESSAGES, FIELD_NAMES } from '@common/constants';

/**
 * 관리자가 변경할 수 있는 예약 상태
 * - estimate_confirmed: 견적 확정 (견적 방문 완료)
 * - completed: 시공 완료
 * - cancelled: 취소
 *
 * 주의: construction_scheduled는 별도의 schedule-construction API로 처리
 */
export enum AdminReservationStatusUpdate {
  /** 견적 확정 (견적 방문 완료) */
  ESTIMATE_CONFIRMED = 'estimate_confirmed',
  /** 완료 */
  COMPLETED = 'completed',
  /** 취소 */
  CANCELLED = 'cancelled',
}

export class UpdateReservationStatusDto {
  @ApiProperty({
    description: '변경할 예약 상태',
    enum: AdminReservationStatusUpdate,
    example: 'estimate_confirmed',
  })
  @IsEnum(AdminReservationStatusUpdate, {
    message: ERROR_MESSAGES.VALIDATION.INVALID_ENUM(
      FIELD_NAMES.status,
      Object.values(AdminReservationStatusUpdate).join(', '),
    ),
  })
  status: AdminReservationStatusUpdate;
}
