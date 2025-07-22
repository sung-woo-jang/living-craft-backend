import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('헬스체크')
@Controller('api/health')
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({
    summary: '헬스체크',
    description: '서버 상태를 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '서버 정상',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 123.456,
        environment: 'development',
      },
    },
  })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('detailed')
  @Public()
  @ApiOperation({
    summary: '상세 헬스체크',
    description: '서버의 상세한 상태 정보를 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '서버 상세 상태',
  })
  detailedHealthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
      },
      cpu: {
        usage: process.cpuUsage(),
      },
    };
  }
}
