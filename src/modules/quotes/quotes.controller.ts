import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteRequestDto } from './dto/request/create-quote-request.dto';
import { QuoteResponseDto } from './dto/response/quote-response.dto';
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

@ApiTags('견적')
@Controller('quotes')
@SwaggerBaseApply()
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post('reservations/:reservationId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '견적 작성',
    description: '특정 예약에 대한 견적을 작성합니다.',
  })
  @ApiParam({
    name: 'reservationId',
    description: '예약 ID',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: '견적 작성 성공',
    type: SuccessBaseResponseDto<QuoteResponseDto>,
  })
  async createQuote(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Body() createDto: CreateQuoteRequestDto,
  ): Promise<SuccessBaseResponseDto<QuoteResponseDto>> {
    const quote = await this.quotesService.createOrUpdateQuote(
      reservationId,
      createDto,
    );
    const responseData = new QuoteResponseDto(quote);
    return new SuccessBaseResponseDto('견적을 작성했습니다.', responseData);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '견적 목록 조회 (관리자)',
    description: '모든 견적 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '견적 목록 조회 성공',
    type: PaginatedResponseDto<QuoteResponseDto>,
  })
  async getQuotes(
    @Query() paginationDto: PaginationRequestDto,
  ): Promise<PaginatedResponseDto<QuoteResponseDto>> {
    const { quotes, meta } = await this.quotesService.findAll(paginationDto);
    const responseData = quotes.map((quote) => new QuoteResponseDto(quote));
    return new PaginatedResponseDto(
      '견적 목록을 조회했습니다.',
      responseData,
      meta,
    );
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '대기 중인 견적 목록',
    description: '견적 작성이 필요한 예약 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '대기 중인 견적 목록 조회 성공',
    type: SuccessBaseResponseDto<QuoteResponseDto[]>,
  })
  async getPendingQuotes(): Promise<
    SuccessBaseResponseDto<QuoteResponseDto[]>
  > {
    const quotes = await this.quotesService.findPendingQuotes();
    const responseData = quotes.map((quote) => new QuoteResponseDto(quote));
    return new SuccessBaseResponseDto(
      '대기 중인 견적 목록을 조회했습니다.',
      responseData,
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: '견적 상세 조회',
    description: '특정 견적의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '견적 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '견적 상세 조회 성공',
    type: SuccessBaseResponseDto<QuoteResponseDto>,
  })
  async getQuote(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessBaseResponseDto<QuoteResponseDto>> {
    const quote = await this.quotesService.findById(id);
    const responseData = new QuoteResponseDto(quote);
    return new SuccessBaseResponseDto(
      '견적 정보를 조회했습니다.',
      responseData,
    );
  }

  @Post(':id/approve')
  @Public()
  @ApiOperation({
    summary: '견적 승인',
    description: '견적을 승인하고 예약을 확정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '견적 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '견적 승인 성공',
    type: SuccessBaseResponseDto<QuoteResponseDto>,
  })
  async approveQuote(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessBaseResponseDto<QuoteResponseDto>> {
    const quote = await this.quotesService.approveQuote(id);
    const responseData = new QuoteResponseDto(quote);
    return new SuccessBaseResponseDto('견적을 승인했습니다.', responseData);
  }

  @Post(':id/reject')
  @Public()
  @ApiOperation({
    summary: '견적 거절',
    description: '견적을 거절합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '견적 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '견적 거절 성공',
    type: SuccessBaseResponseDto<QuoteResponseDto>,
  })
  async rejectQuote(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string,
  ): Promise<SuccessBaseResponseDto<QuoteResponseDto>> {
    const quote = await this.quotesService.rejectQuote(id, reason);
    const responseData = new QuoteResponseDto(quote);
    return new SuccessBaseResponseDto('견적을 거절했습니다.', responseData);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '견적 수정',
    description: '견적 정보를 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '견적 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '견적 수정 성공',
    type: SuccessBaseResponseDto<QuoteResponseDto>,
  })
  async updateQuote(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: CreateQuoteRequestDto,
  ): Promise<SuccessBaseResponseDto<QuoteResponseDto>> {
    const quote = await this.quotesService.findById(id);
    const updatedQuote = await this.quotesService.createOrUpdateQuote(
      quote.reservationId,
      updateDto,
    );
    const responseData = new QuoteResponseDto(updatedQuote);
    return new SuccessBaseResponseDto('견적을 수정했습니다.', responseData);
  }
}
