import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReservationResponseDto } from '../dto/response/reservation-response.dto';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { swaggerBaseApplyDecorator } from '@common/decorators/swagger-base-apply.decorator';
import {
  SuccessBaseResponseDto,
  PaginatedResponseDto,
} from '@common/dto/response/success-base-response.dto';

const apiSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: '예약 조회 성공',
  type: SuccessBaseResponseDto,
};

const apiPaginatedResponse: ApiResponseOptions = {
  status: 200,
  description: '예약 목록 조회 성공',
  type: PaginatedResponseDto,
};

export const GetReservationSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiResponse(apiSuccessResponse),
  );
};

export const GetReservationsSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiResponse(apiPaginatedResponse),
  );
};

export const GetMyReservationsSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiResponse(apiPaginatedResponse),
  );
};

export const GetTodayReservationsSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiResponse(apiSuccessResponse),
  );
};
