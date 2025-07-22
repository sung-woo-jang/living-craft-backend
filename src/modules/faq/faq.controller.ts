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
import { FaqService, CreateFaqData } from './faq.service';
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

@ApiTags('FAQ')
@Controller('api/faq')
@SwaggerBaseApply()
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'FAQ 목록 조회',
    description: '활성화된 FAQ 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'FAQ 목록 조회 성공',
  })
  async getFaqs(@Query('category') category?: string) {
    const faqs = await this.faqService.findActiveFaqs(category);
    return new SuccessBaseResponseDto('FAQ 목록을 조회했습니다.', faqs);
  }

  @Get('categories')
  @Public()
  @ApiOperation({
    summary: 'FAQ 카테고리 목록 조회',
    description: 'FAQ 카테고리 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '카테고리 목록 조회 성공',
  })
  async getCategories() {
    const categories = await this.faqService.getCategories();
    return new SuccessBaseResponseDto(
      '카테고리 목록을 조회했습니다.',
      categories,
    );
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'FAQ 목록 조회 (관리자)',
    description: '모든 FAQ 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'FAQ 목록 조회 성공',
  })
  async getFaqsForAdmin(@Query() paginationDto: PaginationRequestDto) {
    const { faqs, meta } = await this.faqService.findAll(paginationDto);
    return new PaginatedResponseDto('FAQ 목록을 조회했습니다.', faqs, meta);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'FAQ 상세 조회',
    description: '특정 FAQ의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: 'FAQ ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'FAQ 상세 조회 성공',
  })
  async getFaq(@Param('id', ParseIntPipe) id: number) {
    const faq = await this.faqService.findById(id);
    return new SuccessBaseResponseDto('FAQ 정보를 조회했습니다.', faq);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'FAQ 등록',
    description: '새로운 FAQ를 등록합니다.',
  })
  @ApiResponse({
    status: 201,
    description: 'FAQ 등록 성공',
  })
  async createFaq(@Body() createData: CreateFaqData) {
    const faq = await this.faqService.create(createData);
    return new SuccessBaseResponseDto('FAQ를 등록했습니다.', faq);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'FAQ 수정',
    description: 'FAQ 정보를 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: 'FAQ ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'FAQ 수정 성공',
  })
  async updateFaq(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateFaqData>,
  ) {
    const faq = await this.faqService.update(id, updateData);
    return new SuccessBaseResponseDto('FAQ를 수정했습니다.', faq);
  }

  @Put(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'FAQ 활성화/비활성화',
    description: 'FAQ의 활성화 상태를 변경합니다.',
  })
  @ApiParam({
    name: 'id',
    description: 'FAQ ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'FAQ 상태 변경 성공',
  })
  async toggleFaq(@Param('id', ParseIntPipe) id: number) {
    const faq = await this.faqService.toggleActive(id);
    return new SuccessBaseResponseDto('FAQ 상태를 변경했습니다.', faq);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'FAQ 삭제',
    description: 'FAQ를 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: 'FAQ ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'FAQ 삭제 성공',
  })
  async deleteFaq(@Param('id', ParseIntPipe) id: number) {
    await this.faqService.remove(id);
    return new SuccessBaseResponseDto('FAQ를 삭제했습니다.', null);
  }
}
