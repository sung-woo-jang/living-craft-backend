import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiBodyOptions } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { CreateServiceRequestDto } from '../dto/request/create-service-request.dto';
import { ServiceResponseDto } from '../dto/response/service-response.dto';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { swaggerBaseApplyDecorator } from '@common/decorators/swagger-base-apply.decorator';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';

const apiBody: ApiBodyOptions = {
  type: CreateServiceRequestDto,
};

const apiCreatedResponse: ApiResponseOptions = {
  status: 201,
  description: '서비스 생성 성공',
  type: SuccessBaseResponseDto,
};

export const CreateServiceSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiBody(apiBody),
    ApiConsumes('application/json'),
    ApiCreatedResponse(apiCreatedResponse),
  );
};
