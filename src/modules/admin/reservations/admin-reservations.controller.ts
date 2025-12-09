import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { SuccessResponseDto } from '@common/dto/response/success-response.dto';
import { AdminReservationsService } from './admin-reservations.service';
import {
  AdminReservationsQueryDto,
  UpdateReservationStatusDto,
} from './dto/request';
import { AdminReservationListResponseDto } from './dto/response';

@Public()
@Controller('admin/reservations')
@ApiTags('관리자 > 예약 관리')
@ApiBearerAuth()
export class AdminReservationsController {
  constructor(
    private readonly adminReservationsService: AdminReservationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: '전체 예약 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: AdminReservationListResponseDto,
  })
  async findAll(
    @Query() query: AdminReservationsQueryDto,
  ): Promise<SuccessResponseDto<AdminReservationListResponseDto>> {
    const result = await this.adminReservationsService.findAll(query);
    return new SuccessResponseDto('예약 목록 조회에 성공했습니다.', result);
  }

  @Post(':id/status')
  @ApiOperation({ summary: '예약 상태 변경' })
  @ApiResponse({ status: 200, description: '상태 변경 성공' })
  @ApiResponse({ status: 404, description: '예약을 찾을 수 없음' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationStatusDto,
  ): Promise<SuccessResponseDto<void>> {
    await this.adminReservationsService.updateStatus(id, dto);
    return new SuccessResponseDto('예약 상태가 변경되었습니다.');
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '예약 취소 (관리자)' })
  @ApiResponse({ status: 200, description: '취소 성공' })
  @ApiResponse({ status: 404, description: '예약을 찾을 수 없음' })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto<void>> {
    await this.adminReservationsService.cancel(id);
    return new SuccessResponseDto('예약이 취소되었습니다.');
  }
}
