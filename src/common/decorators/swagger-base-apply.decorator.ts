import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ErrorResponseDto,
  UnAuthorizedResponseDto,
  ValidationErrorResponseDto,
} from '@common/dto/response/error-response.dto';
import { SuccessBaseResponseDto, PaginatedResponseDto } from '@common/dto/response/success-base-response.dto';
import { applyDecorators } from '@nestjs/common';

export const SwaggerBaseApply = (
  ...decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>
) =>
  applyDecorators(
    ApiExtraModels(SuccessBaseResponseDto, PaginatedResponseDto, ErrorResponseDto),
    ApiInternalServerErrorResponse({
      description: '서버 내부 오류',
      type: ErrorResponseDto,
      schema: {
        example: {
          success: false,
          message: '서버 내부 오류가 발생했습니다.',
          statusCode: 500,
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: '인증되지 않은 요청',
      type: UnAuthorizedResponseDto,
      schema: {
        example: {
          success: false,
          message: '인증이 필요합니다.',
          statusCode: 401,
          isLogin: false,
        },
      },
    }),
    ApiBadRequestResponse({
      description: '잘못된 요청',
      type: ValidationErrorResponseDto,
      schema: {
        example: {
          success: false,
          message: '요청 데이터가 유효하지 않습니다.',
          statusCode: 400,
          validationErrors: [
            {
              field: 'email',
              errors: ['이메일 형식이 올바르지 않습니다.'],
            },
          ],
        },
      },
    }),
    ...decorators,
  );

// plav-buds 패턴과 호환되는 별칭 생성
export const swaggerBaseApplyDecorator = SwaggerBaseApply;
