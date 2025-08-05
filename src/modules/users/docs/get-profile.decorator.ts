import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/response/user-response.dto';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { swaggerBaseApplyDecorator } from '@common/decorators/swagger-base-apply.decorator';
import { SuccessBaseResponseDto, PaginatedResponseDto } from '@common/dto/response/success-base-response.dto';

const apiMyProfileResponse: ApiResponseOptions = {
  status: 200,
  description: '사용자 정보 조회 성공',
  type: SuccessBaseResponseDto,
};

const apiMySettingsResponse: ApiResponseOptions = {
  status: 200,
  description: '설정 정보 조회 성공',
  type: SuccessBaseResponseDto,
};

const apiPaginatedResponse: ApiResponseOptions = {
  status: 200,
  description: '고객 목록 조회 성공',
  type: PaginatedResponseDto,
};

const apiUserDetailResponse: ApiResponseOptions = {
  status: 200,
  description: '사용자 상세 조회 성공',
  type: SuccessBaseResponseDto,
};

export const GetMyProfileSwaggerDecorator = (apiOperation: ApiOperationOptions) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiResponse(apiMyProfileResponse)
  );
};

export const GetMySettingsSwaggerDecorator = (apiOperation: ApiOperationOptions) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiResponse(apiMySettingsResponse)
  );
};

export const GetCustomersSwaggerDecorator = (apiOperation: ApiOperationOptions) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiResponse(apiPaginatedResponse)
  );
};

export const GetUserByIdSwaggerDecorator = (apiOperation: ApiOperationOptions) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiParam({
      name: 'id',
      description: '사용자 ID',
      example: 1,
    }),
    ApiResponse(apiUserDetailResponse)
  );
};