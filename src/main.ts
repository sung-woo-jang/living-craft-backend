import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as session from 'express-session';
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

  // Session 설정 (네이버 OAuth용)
  app.use(
    session({
      secret: configService.get<string>('jwt.secret'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: environment === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 24시간
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
      .setTitle('예약 서비스 플랫폼 API')
      .setDescription('1인 사업자용 예약 서비스 플랫폼의 API 문서입니다.')
      .setVersion('1.0')
      .addTag('인증', '로그인, 회원가입 관련 API')
      .addTag('사용자', '사용자 관리 관련 API')
      .addTag('서비스', '서비스 관리 관련 API')
      .addTag('예약', '예약 관리 관련 API')
      .addTag('견적', '견적 관리 관련 API')
      .addTag('리뷰', '리뷰 관리 관련 API')
      .addTag('캘린더', '일정 관리 관련 API')
      .addTag('포트폴리오', '포트폴리오 관리 관련 API')
      .addTag('알림', '알림 관리 관련 API')
      .addTag('FAQ', 'FAQ 관리 관련 API')
      .addTag('파일', '파일 업로드 관련 API')
      .addTag('헬스체크', '서버 상태 확인 API')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'JWT 토큰을 입력하세요',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: '예약 서비스 플랫폼 API 문서',
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
