import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { SwaggerBaseApply } from '@common/decorators/swagger-base-apply.decorator';
import {
  SuccessBaseResponseDto,
  PaginatedResponseDto,
} from '@common/dto/response/success-base-response.dto';
import { Type } from '@nestjs/common';

interface GetResponseOptions {
  description?: string;
  isArray?: boolean;
  isPaginated?: boolean;
}

export const GetResponseDecorator = <T = any>(
  responseType?: Type<T>,
  options: GetResponseOptions = {},
) => {
  return (apiOperation: ApiOperationOptions) => {
    const {
      description = '조회 성공',
      isArray = false,
      isPaginated = false,
    } = options;

    let responseSchema: any;

    if (isPaginated && responseType) {
      responseSchema = { type: PaginatedResponseDto };
    } else if (responseType) {
      responseSchema = { type: SuccessBaseResponseDto };
    } else {
      responseSchema = { type: SuccessBaseResponseDto };
    }

    const apiResponse: ApiResponseOptions = {
      status: 200,
      description,
      ...responseSchema,
    };

    return SwaggerBaseApply(
      ApiOperation(apiOperation),
      ApiResponse(apiResponse),
    );
  };
};
