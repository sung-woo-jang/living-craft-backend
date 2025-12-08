import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SuccessResponseDto } from '@common/dto/response/success-response.dto';
import { AdminServicesService } from './admin-services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/request';
import { Service } from '@modules/services/entities';

@Controller('api/admin/services')
@ApiTags('관리자 > 서비스 관리')
@ApiBearerAuth()
export class AdminServicesController {
  constructor(private readonly adminServicesService: AdminServicesService) {}

  @Get()
  @ApiOperation({ summary: '서비스 목록 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async findAll(): Promise<SuccessResponseDto<Service[]>> {
    const result = await this.adminServicesService.findAll();
    return new SuccessResponseDto('서비스 목록 조회에 성공했습니다.', result);
  }

  @Get(':id')
  @ApiOperation({ summary: '서비스 상세 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 404, description: '서비스를 찾을 수 없음' })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto<Service>> {
    const result = await this.adminServicesService.findById(id);
    return new SuccessResponseDto('서비스 상세 조회에 성공했습니다.', result);
  }

  @Post()
  @ApiOperation({ summary: '서비스 생성' })
  @ApiResponse({ status: 201, description: '생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  async create(
    @Body() dto: CreateServiceDto,
  ): Promise<SuccessResponseDto<Service>> {
    const result = await this.adminServicesService.create(dto);
    return new SuccessResponseDto('서비스가 생성되었습니다.', result);
  }

  @Post(':id')
  @ApiOperation({ summary: '서비스 수정' })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({ status: 404, description: '서비스를 찾을 수 없음' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto,
  ): Promise<SuccessResponseDto<Service>> {
    const result = await this.adminServicesService.update(id, dto);
    return new SuccessResponseDto('서비스가 수정되었습니다.', result);
  }

  @Post(':id/delete')
  @ApiOperation({ summary: '서비스 삭제' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 404, description: '서비스를 찾을 수 없음' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto<void>> {
    await this.adminServicesService.delete(id);
    return new SuccessResponseDto('서비스가 삭제되었습니다.');
  }
}
