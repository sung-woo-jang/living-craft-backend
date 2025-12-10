import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@common/decorators';
import { SuccessResponseDto } from '@common/dto/response';
import { IconsService } from './icons.service';
import { IconType } from './enums/icon-type.enum';
import { IconListDto } from '@modules/icons/dto';

@Controller('icons')
@ApiTags('아이콘')
export class IconsController {
  constructor(private readonly iconsService: IconsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: '아이콘 목록 조회',
    description:
      '등록된 모든 아이콘을 조회합니다. 타입별 필터링 및 이름 검색 가능.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: IconType,
    description: '아이콘 타입 필터 (FILL, MONO, COLOR)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: '아이콘 이름 검색어',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '최대 결과 개수 (기본: 100, 최대: 500)',
  })
  @ApiResponse({
    status: 200,
    description: '아이콘 목록 조회 성공',
    type: [IconListDto],
  })
  async findAll(
    @Query('type') type?: IconType,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
  ): Promise<SuccessResponseDto<IconListDto[]>> {
    const icons = await this.iconsService.findAll(type, search, limit);
    return new SuccessResponseDto('아이콘 목록 조회에 성공했습니다.', icons);
  }
}
