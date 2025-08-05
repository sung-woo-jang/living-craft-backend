import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiBodyOptions } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { SwaggerBaseApply } from '@common/decorators/swagger-base-apply.decorator';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';
import { Type } from '@nestjs/common';

interface PostResponseOptions {
  description?: string;
  status?: 200 | 201;
  requestType?: Type<any>;
  consumes?: string;
}

export const PostResponseDecorator = <T = any>(
  responseType?: Type<T>,
  options: PostResponseOptions = {},
) => {
  return (apiOperation: ApiOperationOptions) => {
    const {
      description = options.status === 201 ? '생성 성공' : '요청 성공',
      status = 201,
      requestType,
      consumes = 'application/json',
    } = options;

    const apiResponse: ApiResponseOptions = {
      status,
      description,
      type: responseType ? SuccessBaseResponseDto : SuccessBaseResponseDto,
    };

    const decorators: any[] = [
      ApiOperation(apiOperation),
      ApiResponse(apiResponse),
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
