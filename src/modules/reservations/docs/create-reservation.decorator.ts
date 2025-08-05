import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiBodyOptions } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { CreateReservationRequestDto } from '../dto/request/create-reservation-request.dto';
import { ReservationResponseDto } from '../dto/response/reservation-response.dto';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { swaggerBaseApplyDecorator } from '@common/decorators/swagger-base-apply.decorator';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';

const apiBody: ApiBodyOptions = {
  type: CreateReservationRequestDto,
};

const apiCreatedResponse: ApiResponseOptions = {
  status: 201,
  description: '예약 생성 성공',
  type: SuccessBaseResponseDto,
};

export const CreateReservationSwaggerDecorator = (
  apiOperation: ApiOperationOptions,
) => {
  return swaggerBaseApplyDecorator(
    ApiOperation(apiOperation),
    ApiBody(apiBody),
    ApiConsumes('application/json'),
    ApiCreatedResponse(apiCreatedResponse),
  );
};
