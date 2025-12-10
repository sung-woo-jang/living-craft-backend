import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '@common/decorators';
import { SuccessResponseDto } from '@common/dto/response';
import { ServicesService } from './services.service';
import {
  ServiceListItemDto,
  ServiceDetailDto,
  CreateServiceDto,
  UpdateServiceDto,
} from './dto';

@Controller('services')
@ApiTags('서비스')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '서비스 목록 조회 (지역 정보 포함)' })
  @ApiResponse({
    status: 200,
    description: '서비스 목록 조회 성공',
    type: [ServiceListItemDto],
  })
  async findAll(): Promise<SuccessResponseDto<ServiceListItemDto[]>> {
    const services = await this.servicesService.findAll();
    return new SuccessResponseDto('서비스 목록 조회에 성공했습니다.', services);
  }

  @Post('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[관리자] 서비스 생성' })
  @ApiResponse({
    status: 201,
    description: '서비스 생성 성공',
    type: ServiceDetailDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async create(
    @Body() dto: CreateServiceDto,
  ): Promise<SuccessResponseDto<ServiceDetailDto>> {
    const service = await this.servicesService.create(dto);
    const detail = await this.servicesService.toServiceDetailDto(service);
    return new SuccessResponseDto('서비스가 생성되었습니다.', detail);
  }

  @Post('admin/:id/update')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[관리자] 서비스 수정' })
  @ApiResponse({
    status: 200,
    description: '서비스 수정 성공',
    type: ServiceDetailDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '서비스를 찾을 수 없음' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto,
  ): Promise<SuccessResponseDto<ServiceDetailDto>> {
    const service = await this.servicesService.update(id, dto);
    const detail = await this.servicesService.toServiceDetailDto(service);
    return new SuccessResponseDto('서비스가 수정되었습니다.', detail);
  }

  @Post('admin/:id/delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[관리자] 서비스 삭제 (Soft Delete)' })
  @ApiResponse({
    status: 200,
    description: '서비스 삭제 성공',
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '서비스를 찾을 수 없음' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto<{ deleted: boolean }>> {
    const result = await this.servicesService.delete(id);
    return new SuccessResponseDto('서비스가 삭제되었습니다.', result);
  }

  @Post('admin/:id/toggle')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[관리자] 서비스 활성/비활성 전환' })
  @ApiResponse({
    status: 200,
    description: '서비스 상태 변경 성공',
    type: ServiceDetailDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '서비스를 찾을 수 없음' })
  async toggle(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseDto<ServiceDetailDto>> {
    const service = await this.servicesService.toggle(id);
    const detail = await this.servicesService.toServiceDetailDto(service);
    const statusMessage = service.isActive ? '활성화' : '비활성화';
    return new SuccessResponseDto(
      `서비스가 ${statusMessage}되었습니다.`,
      detail,
    );
  }
}
