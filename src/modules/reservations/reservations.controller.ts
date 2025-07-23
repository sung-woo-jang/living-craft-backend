import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationRequestDto } from './dto/request/create-reservation-request.dto';
import { ReservationResponseDto } from './dto/response/reservation-response.dto';
import {
  SuccessBaseResponseDto,
  PaginatedResponseDto,
} from '@common/dto/response/success-base-response.dto';
import { PaginationRequestDto } from '@common/dto/request/pagination-request.dto';
import { SwaggerBaseApply } from '@common/decorators/swagger-base-apply.decorator';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import { UserRole, ReservationStatus } from '@common/enums';

@ApiTags('예약')
@Controller('reservations')
@SwaggerBaseApply()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @Public()
  @ApiOperation({
    summary: '예약 생성',
    description: '새로운 예약을 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '예약 생성 성공',
    type: SuccessBaseResponseDto<ReservationResponseDto>,
  })
  async createReservation(
    @Body() createDto: CreateReservationRequestDto,
    @CurrentUser() user?: any,
  ): Promise<SuccessBaseResponseDto<ReservationResponseDto>> {
    const reservation = await this.reservationsService.create(
      createDto,
      user?.sub,
    );
    const responseData = ReservationResponseDto.fromEntity(reservation);
    return new SuccessBaseResponseDto('예약을 생성했습니다.', responseData);
  }

  @Get('search')
  @Public()
  @ApiOperation({
    summary: '예약번호로 조회',
    description: '예약번호로 예약 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '예약 조회 성공',
    type: SuccessBaseResponseDto<ReservationResponseDto>,
  })
  async searchReservation(
    @Query('code') reservationCode: string,
  ): Promise<SuccessBaseResponseDto<ReservationResponseDto>> {
    const reservation =
      await this.reservationsService.findByReservationCode(reservationCode);
    const responseData = ReservationResponseDto.fromEntity(reservation);
    return new SuccessBaseResponseDto(
      '예약 정보를 조회했습니다.',
      responseData,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '예약 목록 조회 (관리자)',
    description: '모든 예약 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '예약 목록 조회 성공',
    type: PaginatedResponseDto<ReservationResponseDto>,
  })
  async getReservations(
    @Query() paginationDto: PaginationRequestDto,
    @Query('status') status?: ReservationStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<PaginatedResponseDto<ReservationResponseDto>> {
    const { reservations, meta } = await this.reservationsService.findAll(
      paginationDto,
      status,
      startDate,
      endDate,
    );

    const responseData = reservations.map((reservation) =>
      ReservationResponseDto.fromEntity(reservation),
    );
    return new PaginatedResponseDto(
      '예약 목록을 조회했습니다.',
      responseData,
      meta,
    );
  }

  @Get('my')
  @ApiOperation({
    summary: '내 예약 목록 조회',
    description: '현재 사용자의 예약 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '예약 목록 조회 성공',
    type: PaginatedResponseDto<ReservationResponseDto>,
  })
  async getMyReservations(
    @Query() paginationDto: PaginationRequestDto,
    @CurrentUser() user: any,
  ): Promise<PaginatedResponseDto<ReservationResponseDto>> {
    const { reservations, meta } = await this.reservationsService.findByUserId(
      user.sub,
      paginationDto,
    );

    const responseData = reservations.map((reservation) =>
      ReservationResponseDto.fromEntity(reservation),
    );
    return new PaginatedResponseDto(
      '예약 목록을 조회했습니다.',
      responseData,
      meta,
    );
  }

  @Get('today')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '오늘의 예약 목록',
    description: '오늘 예정된 예약 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '오늘의 예약 목록 조회 성공',
    type: SuccessBaseResponseDto<ReservationResponseDto[]>,
  })
  async getTodayReservations(): Promise<
    SuccessBaseResponseDto<ReservationResponseDto[]>
  > {
    const reservations = await this.reservationsService.findTodayReservations();
    const responseData = reservations.map((reservation) =>
      ReservationResponseDto.fromEntity(reservation),
    );
    return new SuccessBaseResponseDto(
      '오늘의 예약 목록을 조회했습니다.',
      responseData,
    );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '예약 상세 조회',
    description: '특정 예약의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '예약 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '예약 상세 조회 성공',
    type: SuccessBaseResponseDto<ReservationResponseDto>,
  })
  async getReservation(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessBaseResponseDto<ReservationResponseDto>> {
    const reservation = await this.reservationsService.findById(id);
    const responseData = ReservationResponseDto.fromEntity(reservation);
    return new SuccessBaseResponseDto(
      '예약 정보를 조회했습니다.',
      responseData,
    );
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '예약 수정',
    description: '예약 정보를 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '예약 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '예약 수정 성공',
    type: SuccessBaseResponseDto<ReservationResponseDto>,
  })
  async updateReservation(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateReservationRequestDto>,
  ): Promise<SuccessBaseResponseDto<ReservationResponseDto>> {
    const reservation = await this.reservationsService.update(id, updateData);
    const responseData = ReservationResponseDto.fromEntity(reservation);
    return new SuccessBaseResponseDto('예약을 수정했습니다.', responseData);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '예약 상태 변경',
    description: '예약의 상태를 변경합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '예약 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '예약 상태 변경 성공',
    type: SuccessBaseResponseDto<ReservationResponseDto>,
  })
  async updateReservationStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: ReservationStatus,
  ): Promise<SuccessBaseResponseDto<ReservationResponseDto>> {
    const reservation = await this.reservationsService.updateStatus(id, status);
    const responseData = ReservationResponseDto.fromEntity(reservation);
    return new SuccessBaseResponseDto(
      '예약 상태를 변경했습니다.',
      responseData,
    );
  }

  @Put(':id/cancel')
  @ApiOperation({
    summary: '예약 취소',
    description: '예약을 취소합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '예약 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '예약 취소 성공',
    type: SuccessBaseResponseDto<ReservationResponseDto>,
  })
  async cancelReservation(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string,
  ): Promise<SuccessBaseResponseDto<ReservationResponseDto>> {
    const reservation = await this.reservationsService.cancel(id, reason);
    const responseData = ReservationResponseDto.fromEntity(reservation);
    return new SuccessBaseResponseDto('예약을 취소했습니다.', responseData);
  }
}
