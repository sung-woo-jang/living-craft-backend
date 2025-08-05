import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiResponse, ApiParam, ApiOperation } from '@nestjs/swagger';
import { ServiceResponseDto } from '../dto/response/service-response.dto';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { swaggerBaseApplyDecorator } from '@common/decorators/swagger-base-apply.decorator';
import {
  SuccessBaseResponseDto,
  PaginatedResponseDto,
} from '@common/dto/response/success-base-response.dto';
import { ServiceType } from '@common/enums';

const apiSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: '서비스 목록 조회 성공',
  type: SuccessBaseResponseDto,
};

const apiPaginatedResponse: ApiResponseOptions = {
  status: 200,
  description: '서비스 목록 조회 성공',
  type: PaginatedResponseDto,
};

const apiDetailResponse: ApiResponseOptions = {
  status: 200,
  description: '서비스 상세 조회 성공',
  type: SuccessBaseResponseDto,
};

export const GetServicesSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiResponse(apiSuccessResponse),
  );
};

export const GetServicesForAdminSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiResponse(apiPaginatedResponse),
  );
};

export const GetServicesByTypeSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiParam({
      name: 'type',
      description: '서비스 타입',
      enum: ServiceType,
    }),
    ApiResponse(apiSuccessResponse),
  );
};

export const GetServiceSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiParam({
      name: 'id',
      description: '서비스 ID',
      example: 1,
    }),
    ApiResponse(apiDetailResponse),
  );
};
