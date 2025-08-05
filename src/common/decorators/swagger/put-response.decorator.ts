import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiOperation, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiBodyOptions } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { SwaggerBaseApply } from '@common/decorators/swagger-base-apply.decorator';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';
import { Type } from '@nestjs/common';

interface PutResponseOptions {
  description?: string;
  requestType?: Type<any>;
  consumes?: string;
}

export const PutResponseDecorator = <T = any>(
  responseType?: Type<T>,
  options: PutResponseOptions = {}
) => {
  return (apiOperation: ApiOperationOptions) => {
    const {
      description = '수정 성공',
      requestType,
      consumes = 'application/json'
    } = options;

    const apiResponse: ApiResponseOptions = {
      status: 200,
      description,
      type: responseType ? SuccessBaseResponseDto : SuccessBaseResponseDto,
    };

    const decorators: any[] = [
      ApiOperation(apiOperation),
      ApiResponse(apiResponse)
    ];

    if (requestType) {
      const apiBody: ApiBodyOptions = {
        type: requestType,
      };
      decorators.push(ApiBody(apiBody));
    }

    if (consumes) {
      decorators.push(ApiConsumes(consumes));
    }

    return SwaggerBaseApply(...decorators);
  };
};