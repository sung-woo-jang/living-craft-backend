import {
  Controller,
  Get,
  Post,
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
import { AdminReviewsService } from './admin-reviews.service';
import { AdminReviewsQueryDto } from './dto/request';
import { AdminReviewListResponseDto } from './dto/response';

@Public()
@Controller('admin/reviews')
@ApiTags('관리자 > 리뷰 관리')
@ApiBearerAuth()
export class AdminReviewsController {
  constructor(private readonly adminReviewsService: AdminReviewsService) {}

  @Get()
  @ApiOperation({ summary: '리뷰 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: AdminReviewListResponseDto,
  })
  async findAll(
    @Query() query: AdminReviewsQueryDto,
  ): Promise<SuccessResponseDto<AdminReviewListResponseDto>> {
    const result = await this.adminReviewsService.findAll(query);
    return new SuccessResponseDto('리뷰 목록 조회에 성공했습니다.', result);
  }

  @Post(':id/delete')
  @ApiOperation({ summary: '리뷰 삭제' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 404, description: '리뷰를 찾을 수 없음' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto<void>> {
    await this.adminReviewsService.delete(id);
    return new SuccessResponseDto('리뷰가 삭제되었습니다.');
  }
}
