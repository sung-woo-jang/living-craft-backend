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
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { ServicesService } from './services.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';

import { CreateServiceDto } from './dto/request/create-service.dto';
import { UpdateServiceDto } from './dto/request/update-service.dto';
import { ServiceFilterDto } from './dto/request/service-filter.dto';
import { ServiceResponseDto } from './dto/response/service-response.dto';
import { SuccessResponseDto } from '../../common/dto/response/success-response.dto';
import { ErrorResponseDto } from '../../common/dto/response/error-response.dto';
import { UserRole, ServiceType } from '../../common/enums';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '서비스 목록 조회 (공개)' })
  @ApiPaginatedResponse(ServiceResponseDto)
  @ApiResponse({ status: 400, description: '잘못된 요청', type: ErrorResponseDto })
  async findAll(@Query() filter: ServiceFilterDto) {
    return this.servicesService.findAll(filter);
  }

  @Public()
  @Get('active')
  @ApiOperation({ summary: '활성화된 서비스 목록 조회 (공개)' })
  @ApiResponse({ 
    status: 200, 
    description: '성공', 
    type: [ServiceResponseDto] 
  })
  async findActiveServices(): Promise<ServiceResponseDto[]> {
    return this.servicesService.findActiveServices();
  }

  @Public()
  @Get('type/:type')
  @ApiOperation({ summary: '타입별 서비스 목록 조회 (공개)' })
  @ApiParam({ 
    name: 'type', 
    description: '서비스 타입', 
    enum: ServiceType 
  })
  @ApiResponse({ 
    status: 200, 
    description: '성공', 
    type: [ServiceResponseDto] 
  })
  @ApiResponse({ status: 400, description: '잘못된 요청', type: ErrorResponseDto })
  async findByType(@Param('type') type: ServiceType): Promise<ServiceResponseDto[]> {
    return this.servicesService.findByType(type);
  }

  @Public()
  @Get('popular')
  @ApiOperation({ summary: '인기 서비스 목록 조회 (공개)' })
  @ApiResponse({ 
    status: 200, 
    description: '성공', 
    type: [ServiceResponseDto] 
  })
  async getPopularServices(@Query('limit') limit?: number): Promise<ServiceResponseDto[]> {
    return this.servicesService.getPopularServices(limit);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '서비스 목록 조회 (관리자용)' })
  @ApiPaginatedResponse(ServiceResponseDto)
  @ApiResponse({ status: 401, description: '인증 실패', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음', type: ErrorResponseDto })
  async findAllForAdmin(@Query() filter: ServiceFilterDto) {
    return this.servicesService.findAll(filter);
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '서비스 통계 조회 (관리자용)' })
  @ApiResponse({ 
    status: 200, 
    description: '성공',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        fixed: { type: 'number' },
        custom: { type: 'number' },
        active: { type: 'number' },
      }
    }
  })
  @ApiResponse({ status: 401, description: '인증 실패', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음', type: ErrorResponseDto })
  async getServiceStats() {
    return this.servicesService.getServiceStats();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '서비스 상세 조회 (공개)' })
  @ApiParam({ name: 'id', description: '서비스 ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: '성공', 
    type: ServiceResponseDto 
  })
  @ApiResponse({ status: 404, description: '서비스를 찾을 수 없음', type: ErrorResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ServiceResponseDto> {
    return this.servicesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '서비스 생성 (관리자용)' })
  @ApiResponse({ 
    status: 201, 
    description: '생성 성공', 
    type: ServiceResponseDto 
  })
  @ApiResponse({ status: 400, description: '잘못된 요청', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음', type: ErrorResponseDto })
  async create(@Body() createServiceDto: CreateServiceDto): Promise<ServiceResponseDto> {
    return this.servicesService.create(createServiceDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '서비스 수정 (관리자용)' })
  @ApiParam({ name: 'id', description: '서비스 ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: '수정 성공', 
    type: ServiceResponseDto 
  })
  @ApiResponse({ status: 400, description: '잘못된 요청', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: '서비스를 찾을 수 없음', type: ErrorResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '서비스 삭제 (관리자용)' })
  @ApiParam({ name: 'id', description: '서비스 ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: '삭제 성공', 
    type: SuccessResponseDto 
  })
  @ApiResponse({ status: 401, description: '인증 실패', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: '서비스를 찾을 수 없음', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: '삭제할 수 없음 (예약 존재)', type: ErrorResponseDto })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseDto<any>> {
    await this.servicesService.delete(id);
    return new SuccessResponseDto('서비스가 성공적으로 삭제되었습니다.');
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '서비스 활성화/비활성화 토글 (관리자용)' })
  @ApiParam({ name: 'id', description: '서비스 ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: '상태 변경 성공', 
    type: ServiceResponseDto 
  })
  @ApiResponse({ status: 401, description: '인증 실패', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: '서비스를 찾을 수 없음', type: ErrorResponseDto })
  async toggleActive(@Param('id', ParseIntPipe) id: number): Promise<ServiceResponseDto> {
    return this.servicesService.toggleActive(id);
  }

  @Patch(':id/display-order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '서비스 표시 순서 변경 (관리자용)' })
  @ApiParam({ name: 'id', description: '서비스 ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: '순서 변경 성공', 
    type: SuccessResponseDto 
  })
  @ApiResponse({ status: 401, description: '인증 실패', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: '서비스를 찾을 수 없음', type: ErrorResponseDto })
  async updateDisplayOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body('displayOrder', ParseIntPipe) displayOrder: number,
  ): Promise<SuccessResponseDto<any>> {
    await this.servicesService.updateDisplayOrder(id, displayOrder);
    return new SuccessResponseDto('표시 순서가 성공적으로 변경되었습니다.');
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '서비스 이미지 추가 (관리자용)' })
  @ApiParam({ name: 'id', description: '서비스 ID', type: 'number' })
  @ApiResponse({ 
    status: 201, 
    description: '이미지 추가 성공', 
    type: SuccessResponseDto 
  })
  @ApiResponse({ status: 401, description: '인증 실패', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: '서비스를 찾을 수 없음', type: ErrorResponseDto })
  async addImage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { imageUrl: string; isMain?: boolean; description?: string },
  ): Promise<SuccessResponseDto<any>> {
    await this.servicesService.addImage(id, body.imageUrl, body.isMain, body.description);
    return new SuccessResponseDto('이미지가 성공적으로 추가되었습니다.');
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '서비스 이미지 삭제 (관리자용)' })
  @ApiParam({ name: 'id', description: '서비스 ID', type: 'number' })
  @ApiParam({ name: 'imageId', description: '이미지 ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: '이미지 삭제 성공', 
    type: SuccessResponseDto 
  })
  @ApiResponse({ status: 401, description: '인증 실패', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: '서비스 또는 이미지를 찾을 수 없음', type: ErrorResponseDto })
  async removeImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<SuccessResponseDto<any>> {
    await this.servicesService.removeImage(id, imageId);
    return new SuccessResponseDto('이미지가 성공적으로 삭제되었습니다.');
  }

  @Patch(':id/images/:imageId/main')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '메인 이미지 설정 (관리자용)' })
  @ApiParam({ name: 'id', description: '서비스 ID', type: 'number' })
  @ApiParam({ name: 'imageId', description: '이미지 ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: '메인 이미지 설정 성공', 
    type: SuccessResponseDto 
  })
  @ApiResponse({ status: 401, description: '인증 실패', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: '서비스 또는 이미지를 찾을 수 없음', type: ErrorResponseDto })
  async setMainImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<SuccessResponseDto<any>> {
    await this.servicesService.setMainImage(id, imageId);
    return new SuccessResponseDto('메인 이미지가 성공적으로 설정되었습니다.');
  }
}
