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
import {
  ReviewsService,
  CreateReviewData,
  UpdateReviewData,
} from './reviews.service';
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
import { UserRole } from '@common/enums';

@ApiTags('리뷰')
@Controller('reviews')
@SwaggerBaseApply()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: '리뷰 목록 조회',
    description: '활성화된 리뷰 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '리뷰 목록 조회 성공',
  })
  async getReviews(@Query() paginationDto: PaginationRequestDto) {
    const { reviews, meta } =
      await this.reviewsService.findActiveReviews(paginationDto);
    return new PaginatedResponseDto('리뷰 목록을 조회했습니다.', reviews, meta);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '리뷰 목록 조회 (관리자)',
    description: '모든 리뷰 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '리뷰 목록 조회 성공',
  })
  async getReviewsForAdmin(@Query() paginationDto: PaginationRequestDto) {
    const { reviews, meta } = await this.reviewsService.findAll(paginationDto);
    return new PaginatedResponseDto('리뷰 목록을 조회했습니다.', reviews, meta);
  }

  @Get('my')
  @ApiOperation({
    summary: '내 리뷰 목록 조회',
    description: '현재 사용자의 리뷰 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '리뷰 목록 조회 성공',
  })
  async getMyReviews(
    @Query() paginationDto: PaginationRequestDto,
    @CurrentUser() user: any,
  ) {
    const { reviews, meta } = await this.reviewsService.findByUserId(
      user.sub,
      paginationDto,
    );
    return new PaginatedResponseDto('리뷰 목록을 조회했습니다.', reviews, meta);
  }

  @Get('stats')
  @Public()
  @ApiOperation({
    summary: '리뷰 통계',
    description: '평점 통계를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '리뷰 통계 조회 성공',
  })
  async getReviewStats() {
    const stats = await this.reviewsService.getRatingStats();
    return new SuccessBaseResponseDto('리뷰 통계를 조회했습니다.', stats);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: '리뷰 상세 조회',
    description: '특정 리뷰의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '리뷰 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '리뷰 상세 조회 성공',
  })
  async getReview(@Param('id', ParseIntPipe) id: number) {
    const review = await this.reviewsService.findById(id);
    return new SuccessBaseResponseDto('리뷰 정보를 조회했습니다.', review);
  }

  @Post()
  @ApiOperation({
    summary: '리뷰 작성',
    description: '새로운 리뷰를 작성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '리뷰 작성 성공',
  })
  async createReview(
    @Body() createData: CreateReviewData,
    @CurrentUser() user?: any,
  ) {
    const reviewData = {
      ...createData,
      userId: user?.sub,
    };

    const review = await this.reviewsService.create(reviewData);
    return new SuccessBaseResponseDto('리뷰를 작성했습니다.', review);
  }

  @Post(':id/update')
  @ApiOperation({
    summary: '리뷰 수정',
    description: '리뷰를 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '리뷰 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '리뷰 수정 성공',
  })
  async updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateReviewData,
  ) {
    const review = await this.reviewsService.update(id, updateData);
    return new SuccessBaseResponseDto('리뷰를 수정했습니다.', review);
  }

  @Post(':id/reply')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '관리자 답글 작성',
    description: '리뷰에 관리자 답글을 작성합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '리뷰 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '답글 작성 성공',
  })
  async addAdminReply(
    @Param('id', ParseIntPipe) id: number,
    @Body('reply') reply: string,
  ) {
    const review = await this.reviewsService.addAdminReply(id, reply);
    return new SuccessBaseResponseDto('답글을 작성했습니다.', review);
  }

  @Post(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '리뷰 활성화/비활성화',
    description: '리뷰의 활성화 상태를 변경합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '리뷰 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '리뷰 상태 변경 성공',
  })
  async toggleReview(@Param('id', ParseIntPipe) id: number) {
    const review = await this.reviewsService.toggleActive(id);
    return new SuccessBaseResponseDto('리뷰 상태를 변경했습니다.', review);
  }

  @Post(':id/delete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '리뷰 삭제',
    description: '리뷰를 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '리뷰 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '리뷰 삭제 성공',
  })
  async deleteReview(@Param('id', ParseIntPipe) id: number) {
    await this.reviewsService.remove(id);
    return new SuccessBaseResponseDto('리뷰를 삭제했습니다.', null);
  }
}
