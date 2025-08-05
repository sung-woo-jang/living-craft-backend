import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import {
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiBodyOptions } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { CreateServiceRequestDto } from '../dto/request/create-service-request.dto';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { swaggerBaseApplyDecorator } from '@common/decorators/swagger-base-apply.decorator';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';

const apiUpdateBody: ApiBodyOptions = {
  type: CreateServiceRequestDto,
};

const apiSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: '서비스 수정 성공',
  type: SuccessBaseResponseDto,
};

const apiToggleResponse: ApiResponseOptions = {
  status: 200,
  description: '서비스 상태 변경 성공',
  type: SuccessBaseResponseDto,
};

const apiDeleteResponse: ApiResponseOptions = {
  status: 200,
  description: '서비스 삭제 성공',
  type: SuccessBaseResponseDto,
};

export const UpdateServiceSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiParam({
      name: 'id',
      description: '서비스 ID',
      example: 1,
    }),
    ApiBody(apiUpdateBody),
    ApiConsumes('application/json'),
    ApiResponse(apiSuccessResponse),
  );
};

export const ToggleServiceSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiParam({
      name: 'id',
      description: '서비스 ID',
      example: 1,
    }),
    ApiResponse(apiToggleResponse),
  );
};

export const DeleteServiceSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiParam({
      name: 'id',
      description: '서비스 ID',
      example: 1,
    }),
    ApiResponse(apiDeleteResponse),
  );
};
