import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { swaggerBaseApplyDecorator } from '@common/decorators/swagger-base-apply.decorator';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';

const apiSuccessResponse: ApiResponseOptions = {
  status: 200,
  description: '네이버 OAuth URL 반환 성공',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            example:
              'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=CALLBACK_URL&state=STATE',
          },
        },
      },
      message: { type: 'string', example: '네이버 인증 URL을 반환했습니다.' },
    },
  },
};

export const NaverAuthUrlSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiResponse(apiSuccessResponse),
  );
};

const apiCallbackResponse: ApiResponseOptions = {
  status: 200,
  description: '네이버 OAuth 로그인 후 HTML 폼으로 안전한 토큰 전달',
  type: SuccessBaseResponseDto,
};

export const NaverCallbackSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiQuery({
      name: 'code',
      description: '네이버에서 전달받은 인증 코드',
      required: true,
    }),
    ApiQuery({
      name: 'state',
      description: 'CSRF 보호를 위한 상태값',
      required: true,
    }),
    ApiResponse(apiCallbackResponse),
  );
};
