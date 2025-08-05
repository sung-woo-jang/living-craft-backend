import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiBody, ApiConsumes, ApiResponse, ApiParam, ApiOperation } from '@nestjs/swagger';
import { ApiBodyOptions } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { ChangePasswordRequestDto } from '../dto/request/change-password-request.dto';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { swaggerBaseApplyDecorator } from '@common/decorators/swagger-base-apply.decorator';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';

const apiChangePasswordBody: ApiBodyOptions = {
  type: ChangePasswordRequestDto,
};

const apiUpdateResponse: ApiResponseOptions = {
  status: 200,
  description: '사용자 정보 수정 성공',
  type: SuccessBaseResponseDto,
};

const apiPasswordResponse: ApiResponseOptions = {
  status: 200,
  description: '비밀번호 변경 성공',
  type: SuccessBaseResponseDto,
};

const apiSettingsResponse: ApiResponseOptions = {
  status: 200,
  description: '설정 정보 수정 성공',
  type: SuccessBaseResponseDto,
};

const apiActivateResponse: ApiResponseOptions = {
  status: 200,
  description: '사용자 활성화 성공',
  type: SuccessBaseResponseDto,
};

const apiDeactivateResponse: ApiResponseOptions = {
  status: 200,
  description: '사용자 비활성화 성공',
  type: SuccessBaseResponseDto,
};

export const UpdateMyProfileSwaggerDecorator = (apiOperation: ApiOperationOptions) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiConsumes('application/json'),
    ApiResponse(apiUpdateResponse)
  );
};

export const ChangePasswordSwaggerDecorator = (apiOperation: ApiOperationOptions) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiBody(apiChangePasswordBody),
    ApiConsumes('application/json'),
    ApiResponse(apiPasswordResponse)
  );
};

export const UpdateMySettingsSwaggerDecorator = (apiOperation: ApiOperationOptions) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiConsumes('application/json'),
    ApiResponse(apiSettingsResponse)
  );
};

export const UpdateUserSwaggerDecorator = (apiOperation: ApiOperationOptions) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiParam({
      name: 'id',
      description: '사용자 ID',
      example: 1,
    }),
    ApiConsumes('application/json'),
    ApiResponse(apiUpdateResponse)
  );
};

export const ActivateUserSwaggerDecorator = (apiOperation: ApiOperationOptions) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiParam({
      name: 'id',
      description: '사용자 ID',
      example: 1,
    }),
    ApiResponse(apiActivateResponse)
  );
};

export const DeactivateUserSwaggerDecorator = (apiOperation: ApiOperationOptions) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiParam({
      name: 'id',
      description: '사용자 ID',
      example: 1,
    }),
    ApiResponse(apiDeactivateResponse)
  );
};