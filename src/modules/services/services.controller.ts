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
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceRequestDto } from './dto/request/create-service-request.dto';
import { ServiceResponseDto } from './dto/response/service-response.dto';
import {
  SuccessBaseResponseDto,
  PaginatedResponseDto,
} from '@common/dto/response/success-base-response.dto';
import { PaginationRequestDto } from '@common/dto/request/pagination-request.dto';
import { SwaggerBaseApply } from '@common/decorators/swagger-base-apply.decorator';
import { Public } from '@common/decorators/public.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import { UserRole, ServiceType } from '@common/enums';
import {
  GetServicesSwaggerDecorator,
  GetServicesForAdminSwaggerDecorator,
  GetServicesByTypeSwaggerDecorator,
  GetServiceSwaggerDecorator,
  CreateServiceSwaggerDecorator,
  UpdateServiceSwaggerDecorator,
  ToggleServiceSwaggerDecorator,
  DeleteServiceSwaggerDecorator,
} from './docs';

@ApiTags('서비스')
@Controller('services')
@SwaggerBaseApply()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Public()
  @GetServicesSwaggerDecorator({
    summary: '서비스 목록 조회',
    description: '활성화된 서비스 목록을 조회합니다.',
  })
  async getServices(): Promise<SuccessBaseResponseDto<ServiceResponseDto[]>> {
    const services = await this.servicesService.findActiveServices();
    const responseData = services.map((service) =>
      ServiceResponseDto.fromEntity(service),
    );
    console.log({ services, responseData });
    return new SuccessBaseResponseDto(
      '서비스 목록을 조회했습니다.',
      responseData,
    );
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @GetServicesForAdminSwaggerDecorator({
    summary: '서비스 목록 조회 (관리자)',
    description: '모든 서비스 목록을 페이지네이션으로 조회합니다.',
  })
  async getServicesForAdmin(
    @Query() paginationDto: PaginationRequestDto,
  ): Promise<PaginatedResponseDto<ServiceResponseDto>> {
    const { services, meta } =
      await this.servicesService.findAll(paginationDto);
    const responseData = services.map((service) =>
      ServiceResponseDto.fromEntity(service),
    );
    return new PaginatedResponseDto(
      '서비스 목록을 조회했습니다.',
      responseData,
      meta,
    );
  }

  @Get('type/:type')
  @Public()
  @GetServicesByTypeSwaggerDecorator({
    summary: '서비스 타입별 조회',
    description: '특정 타입의 서비스 목록을 조회합니다.',
  })
  async getServicesByType(
    @Param('type') type: ServiceType,
  ): Promise<SuccessBaseResponseDto<ServiceResponseDto[]>> {
    const services = await this.servicesService.findByType(type);
    const responseData = services.map((service) =>
      ServiceResponseDto.fromEntity(service),
    );
    return new SuccessBaseResponseDto(
      '서비스 목록을 조회했습니다.',
      responseData,
    );
  }

  @Get(':id')
  @Public()
  @GetServiceSwaggerDecorator({
    summary: '서비스 상세 조회',
    description: '특정 서비스의 상세 정보를 조회합니다.',
  })
  async getService(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessBaseResponseDto<ServiceResponseDto>> {
    const service = await this.servicesService.findById(id);
    const responseData = ServiceResponseDto.fromEntity(service);
    return new SuccessBaseResponseDto(
      '서비스 정보를 조회했습니다.',
      responseData,
    );
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @CreateServiceSwaggerDecorator({
    summary: '서비스 생성',
    description: '새로운 서비스를 생성합니다.',
  })
  async createService(
    @Body() createDto: CreateServiceRequestDto,
  ): Promise<SuccessBaseResponseDto<ServiceResponseDto>> {
    const service = await this.servicesService.create(createDto);
    const responseData = ServiceResponseDto.fromEntity(service);
    return new SuccessBaseResponseDto('서비스를 생성했습니다.', responseData);
  }

  @Post(':id/update')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UpdateServiceSwaggerDecorator({
    summary: '서비스 수정',
    description: '서비스 정보를 수정합니다.',
  })
  async updateService(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateServiceRequestDto>,
  ): Promise<SuccessBaseResponseDto<ServiceResponseDto>> {
    const service = await this.servicesService.update(id, updateDto);
    const responseData = ServiceResponseDto.fromEntity(service);
    return new SuccessBaseResponseDto('서비스를 수정했습니다.', responseData);
  }

  @Post(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ToggleServiceSwaggerDecorator({
    summary: '서비스 활성화/비활성화',
    description: '서비스의 활성화 상태를 변경합니다.',
  })
  async toggleService(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessBaseResponseDto<ServiceResponseDto>> {
    const service = await this.servicesService.toggleActive(id);
    const responseData = ServiceResponseDto.fromEntity(service);
    return new SuccessBaseResponseDto(
      '서비스 상태를 변경했습니다.',
      responseData,
    );
  }

  @Post(':id/delete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @DeleteServiceSwaggerDecorator({
    summary: '서비스 삭제',
    description: '서비스를 삭제합니다.',
  })
  async deleteService(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessBaseResponseDto<null>> {
    await this.servicesService.remove(id);
    return new SuccessBaseResponseDto('서비스를 삭제했습니다.', null);
  }
}
