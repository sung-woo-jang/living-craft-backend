import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';
import { SwaggerBaseApply } from '@common/decorators/swagger-base-apply.decorator';
import { Public } from '@common/decorators/public.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import { UserRole } from '@common/enums';

@ApiTags('캘린더')
@Controller('calendar')
@SwaggerBaseApply()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('available')
  @Public()
  @ApiOperation({
    summary: '예약 가능 날짜 조회',
    description: '예약 가능한 날짜 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '예약 가능 날짜 조회 성공',
  })
  async getAvailableDates(@Query('months') months?: number) {
    const dates = await this.calendarService.getAvailableDates(months);
    return new SuccessBaseResponseDto('예약 가능 날짜를 조회했습니다.', dates);
  }

  @Get('slots')
  @Public()
  @ApiOperation({
    summary: '예약 가능 시간 슬롯 조회',
    description: '특정 날짜의 예약 가능한 시간 슬롯을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '시간 슬롯 조회 성공',
  })
  async getAvailableSlots(@Query('date') dateStr: string) {
    const date = new Date(dateStr);
    const slots = await this.calendarService.getAvailableSlots(date);
    return new SuccessBaseResponseDto('시간 슬롯을 조회했습니다.', slots);
  }

  @Get('settings')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '영업시간 설정 조회',
    description: '요일별 영업시간 설정을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '영업시간 설정 조회 성공',
  })
  async getSettings() {
    const settings = await this.calendarService.getSettings();
    return new SuccessBaseResponseDto(
      '영업시간 설정을 조회했습니다.',
      settings,
    );
  }

  @Post('settings/:dayOfWeek/update')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '영업시간 설정 수정',
    description: '특정 요일의 영업시간을 설정합니다.',
  })
  @ApiParam({
    name: 'dayOfWeek',
    description: '요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '영업시간 설정 성공',
  })
  async updateSetting(
    @Param('dayOfWeek', ParseIntPipe) dayOfWeek: number,
    @Body()
    updateData: {
      openTime?: string;
      closeTime?: string;
      isHoliday?: boolean;
    },
  ) {
    const setting = await this.calendarService.updateSetting(
      dayOfWeek,
      updateData.openTime,
      updateData.closeTime,
      updateData.isHoliday,
    );
    return new SuccessBaseResponseDto('영업시간을 설정했습니다.', setting);
  }

  @Get('blocked')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '차단된 날짜 목록 조회',
    description: '예약이 차단된 날짜 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '차단된 날짜 목록 조회 성공',
  })
  async getBlockedDates() {
    const blockedDates = await this.calendarService.getBlockedDates();
    return new SuccessBaseResponseDto(
      '차단된 날짜 목록을 조회했습니다.',
      blockedDates,
    );
  }

  @Post('block')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '날짜 차단',
    description: '특정 날짜를 예약 불가능하게 차단합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '날짜 차단 성공',
  })
  async blockDate(@Body() blockData: { date: string; reason?: string }) {
    const date = new Date(blockData.date);
    const blockedDate = await this.calendarService.blockDate(
      date,
      blockData.reason,
    );
    return new SuccessBaseResponseDto('날짜를 차단했습니다.', blockedDate);
  }

  @Post('block/:date/remove')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '날짜 차단 해제',
    description: '차단된 날짜를 해제합니다.',
  })
  @ApiParam({
    name: 'date',
    description: '날짜 (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @ApiResponse({
    status: 200,
    description: '날짜 차단 해제 성공',
  })
  async unblockDate(@Param('date') dateStr: string) {
    const date = new Date(dateStr);
    await this.calendarService.unblockDate(date);
    return new SuccessBaseResponseDto('날짜 차단을 해제했습니다.', null);
  }
}
