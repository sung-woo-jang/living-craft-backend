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
import { PortfolioService, CreatePortfolioData } from './portfolio.service';
import {
  SuccessBaseResponseDto,
  PaginatedResponseDto,
} from '@common/dto/response/success-base-response.dto';
import { PaginationRequestDto } from '@common/dto/request/pagination-request.dto';
import { SwaggerBaseApply } from '@common/decorators/swagger-base-apply.decorator';
import { Public } from '@common/decorators/public.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import { UserRole } from '@common/enums';

@ApiTags('포트폴리오')
@Controller('portfolio')
@SwaggerBaseApply()
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: '포트폴리오 목록 조회',
    description: '활성화된 포트폴리오 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '포트폴리오 목록 조회 성공',
  })
  async getPortfolios(@Query() paginationDto: PaginationRequestDto) {
    const { portfolios, meta } =
      await this.portfolioService.findActivePortfolios(paginationDto);
    return new PaginatedResponseDto(
      '포트폴리오 목록을 조회했습니다.',
      portfolios,
      meta,
    );
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '포트폴리오 목록 조회 (관리자)',
    description: '모든 포트폴리오 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '포트폴리오 목록 조회 성공',
  })
  async getPortfoliosForAdmin(@Query() paginationDto: PaginationRequestDto) {
    const { portfolios, meta } =
      await this.portfolioService.findAll(paginationDto);
    return new PaginatedResponseDto(
      '포트폴리오 목록을 조회했습니다.',
      portfolios,
      meta,
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: '포트폴리오 상세 조회',
    description: '특정 포트폴리오의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '포트폴리오 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '포트폴리오 상세 조회 성공',
  })
  async getPortfolio(@Param('id', ParseIntPipe) id: number) {
    const portfolio = await this.portfolioService.findById(id);
    return new SuccessBaseResponseDto(
      '포트폴리오 정보를 조회했습니다.',
      portfolio,
    );
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '포트폴리오 등록',
    description: '새로운 포트폴리오를 등록합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '포트폴리오 등록 성공',
  })
  async createPortfolio(@Body() createData: CreatePortfolioData) {
    const portfolio = await this.portfolioService.create(createData);
    return new SuccessBaseResponseDto('포트폴리오를 등록했습니다.', portfolio);
  }

  @Post(':id/update')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '포트폴리오 수정',
    description: '포트폴리오 정보를 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '포트폴리오 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '포트폴리오 수정 성공',
  })
  async updatePortfolio(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreatePortfolioData>,
  ) {
    const portfolio = await this.portfolioService.update(id, updateData);
    return new SuccessBaseResponseDto('포트폴리오를 수정했습니다.', portfolio);
  }

  @Post(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '포트폴리오 활성화/비활성화',
    description: '포트폴리오의 활성화 상태를 변경합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '포트폴리오 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '포트폴리오 상태 변경 성공',
  })
  async togglePortfolio(@Param('id', ParseIntPipe) id: number) {
    const portfolio = await this.portfolioService.toggleActive(id);
    return new SuccessBaseResponseDto(
      '포트폴리오 상태를 변경했습니다.',
      portfolio,
    );
  }

  @Post(':id/order/update')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '포트폴리오 순서 변경',
    description: '포트폴리오의 표시 순서를 변경합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '포트폴리오 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '포트폴리오 순서 변경 성공',
  })
  async updatePortfolioOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body('displayOrder') displayOrder: number,
  ) {
    const portfolio = await this.portfolioService.updateDisplayOrder(
      id,
      displayOrder,
    );
    return new SuccessBaseResponseDto(
      '포트폴리오 순서를 변경했습니다.',
      portfolio,
    );
  }

  @Post(':id/delete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '포트폴리오 삭제',
    description: '포트폴리오를 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '포트폴리오 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '포트폴리오 삭제 성공',
  })
  async deletePortfolio(@Param('id', ParseIntPipe) id: number) {
    await this.portfolioService.remove(id);
    return new SuccessBaseResponseDto('포트폴리오를 삭제했습니다.', null);
  }
}
