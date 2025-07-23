import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  NotificationType,
  NotificationChannel,
} from './entities/notification-template.entity';
import {
  SuccessBaseResponseDto,
  PaginatedResponseDto,
} from '@common/dto/response/success-base-response.dto';
import { SwaggerBaseApply } from '@common/decorators/swagger-base-apply.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import { UserRole } from '@common/enums';

@ApiTags('알림')
@Controller('notifications')
@SwaggerBaseApply()
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('templates')
  @ApiOperation({
    summary: '알림 템플릿 목록 조회',
    description: '모든 알림 템플릿을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '템플릿 목록 조회 성공',
  })
  async getTemplates() {
    const templates = await this.notificationsService.getAllTemplates();
    return new SuccessBaseResponseDto('알림 템플릿을 조회했습니다.', templates);
  }

  @Put('templates/:type/:channel')
  @ApiOperation({
    summary: '알림 템플릿 수정',
    description: '특정 알림 템플릿을 수정합니다.',
  })
  @ApiParam({
    name: 'type',
    description: '알림 타입',
    enum: NotificationType,
  })
  @ApiParam({
    name: 'channel',
    description: '알림 채널',
    enum: NotificationChannel,
  })
  @ApiResponse({
    status: 200,
    description: '템플릿 수정 성공',
  })
  async updateTemplate(
    @Param('type', new ParseEnumPipe(NotificationType)) type: NotificationType,
    @Param('channel', new ParseEnumPipe(NotificationChannel))
    channel: NotificationChannel,
    @Body()
    updateData: { subject?: string; content: string; isActive?: boolean },
  ) {
    const template = await this.notificationsService.updateTemplate(
      type,
      channel,
      updateData,
    );
    return new SuccessBaseResponseDto('알림 템플릿을 수정했습니다.', template);
  }

  @Get('logs')
  @ApiOperation({
    summary: '알림 발송 이력 조회',
    description: '알림 발송 이력을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '발송 이력 조회 성공',
  })
  async getLogs(@Query('page') page = 1, @Query('limit') limit = 20) {
    const { logs, total } = await this.notificationsService.getLogs(
      page,
      limit,
    );
    return new SuccessBaseResponseDto('알림 발송 이력을 조회했습니다.', {
      logs,
      total,
    });
  }
}
