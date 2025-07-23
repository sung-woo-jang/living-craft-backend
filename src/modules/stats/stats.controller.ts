import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StatsService, DashboardStats, MonthlyStats, ServiceStats } from './stats.service';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';
import { SwaggerBaseApply } from '@common/decorators/swagger-base-apply.decorator';

@ApiTags('통계')
@Controller('stats')
@SwaggerBaseApply()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @ApiOperation({ 
    summary: '대시보드 통계 조회',
    description: '전체 예약, 견적, 고객, 리뷰 통계를 조회합니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '대시보드 통계 조회 성공',
    type: SuccessBaseResponseDto<DashboardStats>,
  })
  async getDashboardStats(): Promise<SuccessBaseResponseDto<DashboardStats>> {
    const stats = await this.statsService.getDashboardStats();
    
    return new SuccessBaseResponseDto(
      '대시보드 통계를 성공적으로 조회했습니다.',
      stats,
    );
  }

  @Get('monthly')
  @ApiOperation({ 
    summary: '월별 통계 조회',
    description: '지정된 연도의 월별 예약 및 매출 통계를 조회합니다.'
  })
  @ApiQuery({ 
    name: 'year', 
    description: '조회할 연도', 
    example: 2024,
    required: false
  })
  @ApiResponse({ 
    status: 200, 
    description: '월별 통계 조회 성공',
    type: SuccessBaseResponseDto<MonthlyStats[]>,
  })
  async getMonthlyStats(
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
  ): Promise<SuccessBaseResponseDto<MonthlyStats[]>> {
    const targetYear = year || new Date().getFullYear();
    const stats = await this.statsService.getMonthlyStats(targetYear);
    
    return new SuccessBaseResponseDto(
      `${targetYear}년 월별 통계를 성공적으로 조회했습니다.`,
      stats,
    );
  }

  @Get('services')
  @ApiOperation({ 
    summary: '서비스별 통계 조회',
    description: '각 서비스별 예약 수, 매출, 평점 통계를 조회합니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '서비스별 통계 조회 성공',
    type: SuccessBaseResponseDto<ServiceStats[]>,
  })
  async getServiceStats(): Promise<SuccessBaseResponseDto<ServiceStats[]>> {
    const stats = await this.statsService.getServiceStats();
    
    return new SuccessBaseResponseDto(
      '서비스별 통계를 성공적으로 조회했습니다.',
      stats,
    );
  }
}
