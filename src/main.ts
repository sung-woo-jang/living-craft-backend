import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

// Explicitly load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 8000);
  const environment = configService.get<string>('app.environment');

  // CORS 설정
  app.enableCors({
    origin: environment === 'development' ? true : ['https://yourdomain.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix
  app.setGlobalPrefix('api', {
    exclude: ['/health', '/'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // 정적 파일 서빙 (업로드된 파일)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Swagger 설정 (개발 환경에서만)
  if (environment === 'development') {
    const config = new DocumentBuilder()
      .setTitle('NestJS 클린 템플릿 API')
      .setDescription(
        '파일 업로드, 헬스 체크, 백오피스 기능을 제공하는 NestJS 템플릿입니다.',
      )
      .setVersion('1.0')
      .addTag('파일', '파일 업로드 관련 API')
      .addTag('헬스체크', '서버 상태 확인 API')
      .addTag('관리자 > 인증', '관리자 로그인 및 인증 API')
      .addTag('관리자 > 사용자 관리', '백오피스 사용자 관리 API')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'NestJS 클린 템플릿 API 문서',
    });

    console.log('📚 Swagger UI available at: http://localhost:8000/api/docs');
  }

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🌍 Environment: ${environment}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

bootstrap().catch((error) => {
  console.error('❌ Error starting application:', error);
  process.exit(1);
});
