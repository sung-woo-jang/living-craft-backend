import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { swaggerBaseApplyDecorator } from '@common/decorators/swagger-base-apply.decorator';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';

const apiSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: '로그아웃 성공',
  type: SuccessBaseResponseDto,
};

export const LogoutSwaggerDecorator = (apiOperation: ApiOperationOptions) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiResponse(apiSuccessResponse),
  );
};
