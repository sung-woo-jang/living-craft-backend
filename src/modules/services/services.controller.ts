import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@common/decorators';
import { SuccessResponseDto } from '@common/dto/response';
import { ServicesService } from './services.service';
import { ServiceListItemDto } from './dto';

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
}
