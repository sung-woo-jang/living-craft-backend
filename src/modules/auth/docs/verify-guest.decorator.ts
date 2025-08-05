import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiBodyOptions } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { VerifyGuestRequestDto } from '../dto/request/verify-guest-request.dto';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { swaggerBaseApplyDecorator } from '@common/decorators/swagger-base-apply.decorator';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';

const apiBody: ApiBodyOptions = {
  type: VerifyGuestRequestDto,
};

const apiSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: '인증 성공',
  type: SuccessBaseResponseDto,
};

export const VerifyGuestSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiBody(apiBody),
    ApiConsumes('application/json'),
    ApiResponse(apiSuccessResponse),
  );
};
