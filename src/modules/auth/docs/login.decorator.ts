import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiBodyOptions } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { LoginRequestDto } from '../dto/request/login-request.dto';
import { LoginResponseDto } from '../dto/response/login-response.dto';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { swaggerBaseApplyDecorator } from '@common/decorators/swagger-base-apply.decorator';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';

const apiBody: ApiBodyOptions = {
  type: LoginRequestDto,
};

const apiSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: '로그인 성공',
  type: SuccessBaseResponseDto,
};

export const LoginSwaggerDecorator = (apiOperation: ApiOperationOptions) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiBody(apiBody),
    ApiConsumes('application/json'),
    ApiResponse(apiSuccessResponse),
  );
};
