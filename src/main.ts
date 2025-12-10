import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { CustomValidationPipe } from '@common/pipes';

// Explicitly load environment variables
dotenv.config();

/**
 * 고객용 API만 포함하는 필터링 함수
 */
function filterGeneralApis(document: OpenAPIObject): OpenAPIObject {
  const filteredPaths = {};

  for (const [path, pathItem] of Object.entries(document.paths)) {
    // /api/admin 경로 제외
    if (path.startsWith('/api/admin')) {
      continue;
    }

    // /api/services/admin 경로 제외
    if (path.startsWith('/api/services/admin')) {
      continue;
    }

    filteredPaths[path] = pathItem;
  }

  return {
    ...document,
    paths: filteredPaths,
  };
}

/**
 * 관리자 API만 포함하는 필터링 함수
 */
function filterAdminApis(document: OpenAPIObject): OpenAPIObject {
  const filteredPaths = {};

  for (const [path, pathItem] of Object.entries(document.paths)) {
    // /api/services/admin 먼저 체크 (더 구체적인 패턴)
    if (path.startsWith('/api/services/admin')) {
      filteredPaths[path] = pathItem;
      continue;
    }

    // /api/admin으로 시작하는 경로 포함
    if (path.startsWith('/api/admin')) {
      filteredPaths[path] = pathItem;
      continue;
    }
  }

  return {
    ...document,
    paths: filteredPaths,
  };
}

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

  // Global pipes - 한국어 에러 메시지를 제공하는 커스텀 ValidationPipe
  app.useGlobalPipes(new CustomValidationPipe());

  // 정적 파일 서빙 (업로드된 파일)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Swagger 설정 (개발 환경에서만)
  if (environment === 'development') {
    // ========================================
    // 1. 고객용 API 문서 (/docs)
    // ========================================
    const generalConfig = new DocumentBuilder()
      .setTitle('Living Craft API - 고객용')
      .setDescription(
        '인테리어 필름 시공 및 유리 청소 출장 서비스 예약 플랫폼 - 고객용 API 문서',
      )
      .setVersion('1.0')
      .addTag('고객 인증', '토스 앱 로그인 및 인증 관리')
      .addTag('서비스', '제공 서비스 조회')
      .addTag('예약', '예약 생성 및 관리')
      .addTag('리뷰', '리뷰 조회 및 작성')
      .addTag('포트폴리오', '포트폴리오 조회')
      .addTag('헬스체크', '서버 상태 확인')
      .addTag('파일', '파일 업로드')
      .addTag('아이콘', '아이콘 조회')
      .addBearerAuth() // 고객 JWT 인증
      .build();

    const generalDocument = SwaggerModule.createDocument(app, generalConfig);
    const filteredGeneralDocument = filterGeneralApis(generalDocument);

    SwaggerModule.setup('docs', app, filteredGeneralDocument, {
      swaggerOptions: {
        persistAuthorization: true, // 새로고침 시 인증 토큰 유지
        tagsSorter: 'alpha', // 태그 알파벳순 정렬
        operationsSorter: 'alpha', // API 알파벳순 정렬
      },
      customSiteTitle: 'Living Craft API - 고객용 문서',
      jsonDocumentUrl: '/docs/json',
    });

    // ========================================
    // 2. 관리자용 API 문서 (/admin-docs)
    // ========================================
    const adminConfig = new DocumentBuilder()
      .setTitle('Living Craft API - 관리자용')
      .setDescription(
        '인테리어 필름 시공 및 유리 청소 출장 서비스 예약 플랫폼 - 백오피스 관리자 API 문서',
      )
      .setVersion('1.0')
      .addTag('인증', '관리자 로그인 및 인증')
      .addTag('서비스 관리', '서비스 CRUD 및 순서 변경')
      .addTag('예약 관리', '예약 조회 및 상태 변경')
      .addTag('리뷰 관리', '리뷰 조회 및 답변 관리')
      .addTag('포트폴리오 관리', '포트폴리오 CRUD')
      .addTag('고객 관리', '고객 정보 관리')
      .addTag('행정구역 관리', '시군구 관리')
      .addTag('사용자 관리', '관리자 사용자 관리')
      .addTag('운영 설정', '운영 시간 및 휴무일 설정')
      .addTag('대시보드', '통계 및 대시보드')
      .addBearerAuth() // 관리자 JWT 인증
      .build();

    const adminDocument = SwaggerModule.createDocument(app, adminConfig);
    const filteredAdminDocument = filterAdminApis(adminDocument);

    SwaggerModule.setup('admin-docs', app, filteredAdminDocument, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'Living Craft API - 관리자 문서',
      jsonDocumentUrl: '/admin-docs/json',
    });

    // 로깅
    console.log('📚 [고객용] Swagger UI: http://localhost:8000/docs');
    console.log('📄 [고객용] Swagger JSON: http://localhost:8000/docs/json');
    console.log(
      `📊 [고객용] API 개수: ${Object.keys(filteredGeneralDocument.paths).length}개`,
    );
    console.log('');
    console.log('🔐 [관리자] Swagger UI: http://localhost:8000/admin-docs');
    console.log(
      '🔒 [관리자] Swagger JSON: http://localhost:8000/admin-docs/json',
    );
    console.log(
      `📊 [관리자] API 개수: ${Object.keys(filteredAdminDocument.paths).length}개`,
    );
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
