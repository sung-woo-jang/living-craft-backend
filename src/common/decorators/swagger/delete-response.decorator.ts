import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { SwaggerBaseApply } from '@common/decorators/swagger-base-apply.decorator';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';

interface DeleteResponseOptions {
  description?: string;
}

export const DeleteResponseDecorator = (
  options: DeleteResponseOptions = {}
) => {
  return (apiOperation: ApiOperationOptions) => {
    const {
      description = '삭제 성공'
    } = options;

    const apiResponse: ApiResponseOptions = {
      status: 200,
      description,
      type: SuccessBaseResponseDto,
    };

    return SwaggerBaseApply(
      ApiOperation(apiOperation),
      ApiResponse(apiResponse)
    );
  };
};