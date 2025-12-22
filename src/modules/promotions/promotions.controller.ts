import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SuccessResponseDto } from '@common/dto/response/success-response.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';
import { Public } from '@common/decorators/public.decorator';
import { PromotionsService } from './promotions.service';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  ReorderPromotionsDto,
} from './dto';
import { Promotion } from './entities';

// ============================================
// Public API (Front용)
// ============================================

@Controller('promotions')
@ApiTags('프로모션 배너')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '활성 프로모션 목록 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async findActivePromotions(): Promise<SuccessResponseDto<Promotion[]>> {
    const result = await this.promotionsService.findActivePromotions();
    return new SuccessResponseDto('프로모션 목록 조회에 성공했습니다.', result);
  }

  @Post(':id/click')
  @Public()
  @ApiOperation({ summary: '프로모션 클릭 수 증가' })
  @ApiResponse({ status: 200, description: '클릭 수 증가 성공' })
  @ApiResponse({ status: 404, description: '프로모션을 찾을 수 없음' })
  async incrementClickCount(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto<void>> {
    await this.promotionsService.incrementClickCount(id);
    return new SuccessResponseDto('클릭 수가 증가되었습니다.');
  }
}

// ============================================
// Admin API
// ============================================

@Controller('admin/promotions')
@ApiTags('관리자 > 프로모션 배너 관리')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class AdminPromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @ApiOperation({ summary: '전체 프로모션 목록 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async findAll(): Promise<SuccessResponseDto<Promotion[]>> {
    const result = await this.promotionsService.findAll();
    return new SuccessResponseDto('프로모션 목록 조회에 성공했습니다.', result);
  }

  @Get(':id')
  @ApiOperation({ summary: '프로모션 상세 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 404, description: '프로모션을 찾을 수 없음' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto<Promotion>> {
    const result = await this.promotionsService.findById(id);
    return new SuccessResponseDto(
      '프로모션 상세 조회에 성공했습니다.',
      result,
    );
  }

  @Post()
  @UseInterceptors(FileInterceptor('icon', { storage: memoryStorage() }))
  @ApiOperation({ summary: '프로모션 생성' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: '친구 초대하고 함께 쿠폰 받기' },
        subtitle: {
          type: 'string',
          example: '이용하는 친구 초대하고 할인 쿠폰 받기!',
        },
        linkUrl: { type: 'string', example: 'https://example.com' },
        linkType: { type: 'string', enum: ['external', 'internal'] },
        startDate: { type: 'string', example: '2024-01-01' },
        endDate: { type: 'string', example: '2024-12-31' },
        isActive: { type: 'boolean', example: true },
        sortOrder: { type: 'number', example: 1 },
        icon: { type: 'string', format: 'binary' },
      },
      required: ['title'],
    },
  })
  @ApiResponse({ status: 201, description: '생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  async create(
    @Body() dto: CreatePromotionDto,
    @UploadedFile() iconFile: Express.Multer.File,
  ): Promise<SuccessResponseDto<Promotion>> {
    const result = await this.promotionsService.create(dto, iconFile);
    return new SuccessResponseDto('프로모션이 생성되었습니다.', result);
  }

  @Post(':id/update')
  @UseInterceptors(FileInterceptor('icon', { storage: memoryStorage() }))
  @ApiOperation({ summary: '프로모션 수정' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: '친구 초대하고 함께 쿠폰 받기' },
        subtitle: {
          type: 'string',
          example: '이용하는 친구 초대하고 할인 쿠폰 받기!',
        },
        linkUrl: { type: 'string', example: 'https://example.com' },
        linkType: { type: 'string', enum: ['external', 'internal'] },
        startDate: { type: 'string', example: '2024-01-01' },
        endDate: { type: 'string', example: '2024-12-31' },
        isActive: { type: 'boolean', example: true },
        sortOrder: { type: 'number', example: 1 },
        icon: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({ status: 404, description: '프로모션을 찾을 수 없음' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePromotionDto,
    @UploadedFile() iconFile: Express.Multer.File,
  ): Promise<SuccessResponseDto<Promotion>> {
    const result = await this.promotionsService.update(id, dto, iconFile);
    return new SuccessResponseDto('프로모션이 수정되었습니다.', result);
  }

  @Post(':id/delete')
  @ApiOperation({ summary: '프로모션 삭제' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 404, description: '프로모션을 찾을 수 없음' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto<void>> {
    await this.promotionsService.delete(id);
    return new SuccessResponseDto('프로모션이 삭제되었습니다.');
  }

  @Post(':id/toggle')
  @ApiOperation({ summary: '프로모션 활성/비활성 전환' })
  @ApiResponse({ status: 200, description: '전환 성공' })
  @ApiResponse({ status: 404, description: '프로모션을 찾을 수 없음' })
  async toggle(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto<Promotion>> {
    const result = await this.promotionsService.toggle(id);
    const status = result.isActive ? '활성화' : '비활성화';
    return new SuccessResponseDto(`프로모션이 ${status}되었습니다.`, result);
  }

  @Post('reorder')
  @ApiOperation({ summary: '프로모션 정렬 순서 변경' })
  @ApiResponse({ status: 200, description: '정렬 순서 변경 성공' })
  async reorder(
    @Body() dto: ReorderPromotionsDto,
  ): Promise<SuccessResponseDto<Promotion[]>> {
    const result = await this.promotionsService.reorder(dto);
    return new SuccessResponseDto('정렬 순서가 변경되었습니다.', result);
  }
}
