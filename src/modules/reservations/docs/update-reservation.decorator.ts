import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import {
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiBodyOptions } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { CreateReservationRequestDto } from '../dto/request/create-reservation-request.dto';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { swaggerBaseApplyDecorator } from '@common/decorators/swagger-base-apply.decorator';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';
import { ReservationStatus } from '@common/enums';

const apiUpdateBody: ApiBodyOptions = {
  type: CreateReservationRequestDto,
};

const apiStatusBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: Object.values(ReservationStatus),
        description: '예약 상태',
      },
    },
    required: ['status'],
  },
};

const apiCancelBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    properties: {
      reason: {
        type: 'string',
        description: '취소 사유',
      },
    },
  },
};

const apiSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: '예약 수정 성공',
  type: SuccessBaseResponseDto,
};

const apiStatusResponse: ApiResponseOptions = {
  status: 200,
  description: '예약 상태 변경 성공',
  type: SuccessBaseResponseDto,
};

const apiCancelResponse: ApiResponseOptions = {
  status: 200,
  description: '예약 취소 성공',
  type: SuccessBaseResponseDto,
};

export const UpdateReservationSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiParam({
      name: 'id',
      description: '예약 ID',
      example: 1,
    }),
    ApiBody(apiUpdateBody),
    ApiConsumes('application/json'),
    ApiResponse(apiSuccessResponse),
  );
};

export const UpdateReservationStatusSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiParam({
      name: 'id',
      description: '예약 ID',
      example: 1,
    }),
    ApiBody(apiStatusBody),
    ApiConsumes('application/json'),
    ApiResponse(apiStatusResponse),
  );
};

export const CancelReservationSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiParam({
      name: 'id',
      description: '예약 ID',
      example: 1,
    }),
    ApiBody(apiCancelBody),
    ApiConsumes('application/json'),
    ApiResponse(apiCancelResponse),
  );
};
