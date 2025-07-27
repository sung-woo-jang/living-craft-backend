# CLAUDE.md

이 파일은 예약 서비스 플랫폼 백엔드 프로젝트에서 Claude Code가 코드 작업을 할 때 가이드를 제공합니다.

## 프로젝트 개요

개인 사업자용 예약 서비스 플랫폼의 백엔드 API 서버입니다. 1인 사업자가 운영하는 현장 방문형 서비스(청소, 수리, 미용 등)의 온라인 예약을 받고 관리할 수 있는 웹 플랫폼입니다.

### 주요 기능

- **인증 시스템**: JWT 기반, 네이버 OAuth, 비회원 예약 지원
- **예약 관리**: 정찰제/견적제 서비스, 실시간 예약 가능 시간 확인
- **관리자 대시보드**: 예약 현황, 견적 관리, 고객 관리
- **알림 시스템**: SMS/이메일 자동 발송 (네이버 클라우드 플랫폼)
- **리뷰 시스템**: 고객 만족도 관리
- **포트폴리오**: 작업 사례 관리

### 핵심 비즈니스 플로우

1. **정찰제 서비스**: 고객이 직접 예약 → 자동 확정 → 서비스 제공 → 리뷰 작성
2. **견적제 서비스**: 고객이 견적 요청 → 관리자가 견적서 작성 → 고객 승인 → 예약 확정 → 서비스 제공

## 개발 명령어

### 기본 명령어
```bash
# Install dependencies
npm install

# Development with hot reload
npm run start:dev

# Production build and run
npm run build
npm run start:prod

# Full development setup (Docker + App)
npm run dev:full
```

### Docker 인프라 관리
```bash
# Start PostgreSQL, Redis, pgAdmin, Redis Commander
npm run docker:dev:up
# or: docker-compose -f docker-compose.local.yml up -d

# Stop services
npm run docker:dev:down

# View logs
npm run docker:dev:logs

# Check service status
npm run docker:dev:status
```

### 데이터베이스 작업
```bash
# Run migrations
npm run migration:run

# Generate new migration
npm run migration:generate -- -n MigrationName

# Revert last migration
npm run migration:revert

# Seed database with initial data
npm run seed:run
```

### 테스트 및 코드 품질
```bash
# Unit tests
npm run test

# Test with coverage
npm run test:cov

# Watch mode for tests
npm run test:watch

# Linting
npm run lint

# Code formatting
npm run format
```

## 프로젝트 아키텍처

### 핵심 기술 스택
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM ORM
- **Cache/Queue**: Redis with Bull Queue
- **Authentication**: JWT + Passport (Local, Naver OAuth)

### 모듈 구조

NestJS 모듈 아키텍처를 따르며 명확한 책임 분리를 합니다:

```
src/modules/
├── auth/           # Authentication & authorization
├── users/          # User management (admin, customers)
├── services/       # Service offerings management
├── reservations/   # Booking system core
├── quotes/         # Custom quote requests
├── calendar/       # Availability & scheduling
├── reviews/        # Customer reviews
├── portfolio/      # Work showcase
├── notifications/  # SMS/Email alerts
├── faq/           # FAQ management
├── files/         # File upload handling
└── health/        # Health check endpoints
```

### 주요 설계 패턴

**경로 별칭** (Jest 및 tsconfig에서 설정됨):
- `@/` → `src/`
- `@common/` → `src/common/`
- `@modules/` → `src/modules/`
- `@config/` → `src/config/`

**글로벌 가드 & 필터**:
- JWT 인증이 `JwtAuthGuard`를 통해 전역적으로 적용됨
- 공개 엔드포인트는 `@Public()` 데코레이터로 인증 우회
- `HttpExceptionFilter`를 통한 전역 예외 처리

**데이터베이스 전략**:
- TypeORM을 사용한 엔티티 우선 접근법
- 공통 필드(id, timestamps)를 위한 Base Entity 패턴 사용
- 개발 모드에서는 synchronize: true 사용 (마이그레이션 불필요)

### 비즈니스 로직 아키텍처

**예약 시스템**:
- 정찰제 및 견적제 서비스 모두 지원
- 예약 상태 흐름: `pending`(대기) → `confirmed`(확정) → `completed`(완료) → `cancelled`(취소)
- 자동 예약번호 생성: `YYYYMMDD-0001` 형식

**사용자 역할**:
- 관리자: 시스템 전체 관리
- 고객: OAuth 및 수동 가입 지원
- 게스트: 비회원 예약 지원

**알림 시스템**:
- 템플릿 기반 알림 시스템
- Bull Queue를 통한 비동기 처리
- SMS(네이버 클라우드 플랫폼) 및 이메일 지원

## 개발 환경 설정

### 사전 요구사항
- Node.js 18+
- Docker & Docker Compose

### 로컬 개발 환경
1. 하이브리드 접근법 사용: Docker는 인프라용, 로컬 Node.js는 앱용
2. 데이터베이스, Redis, pgAdmin은 컨테이너에서 실행 (설정 간편화)
3. NestJS 앱은 로컬에서 실행 (디버깅 경험 향상)

### 환경 변수 설정
- `.env` 파일 사용, `.env.local`로 폴백
- 데이터베이스 기본값: localhost:5432, postgres/password123, reservation_dev
- JWT_SECRET 환경 변수 필수
- 네이버 OAuth는 NAVER_CLIENT_ID, NAVER_CLIENT_SECRET 필요

### 개발 환경 접속 포인트
- API 서버: http://localhost:8000
- Swagger API 문서: http://localhost:8000/api/docs
- 헬스 체크: http://localhost:8000/health
- pgAdmin: http://localhost:5050 (admin@reservation.com / admin123)
- Redis Commander: http://localhost:8081

## 코딩 컨벤션 및 스타일 가이드

### 기본 원칙

- **정보 부족 시**: 명확히 요청하고 필요한 정보를 구체적으로 요구
- **개선점 발견 시**: 먼저 개선점을 설명하고 계획을 제시한 후 작업
- **모든 응답**: 한국어로 작성
- **직접 수정 금지**: 분석 및 계획 단계를 거친 후 수정

### 네이밍 컨벤션

#### 파일 및 폴더 구조

```typescript
// 폴더명: kebab-case
purchase-request/
delivery-location/

// 모듈 파일: PascalCase
PurchaseRequestController.ts
UserService.ts
ReservationEntity.ts

// 일반 파일: camelCase
userValidator.ts
dateFormatter.ts
reservationHelper.ts
```

#### 변수 및 상수

```typescript
// 변수: camelCase
const userName = 'john';
const reservationList = [];
const totalAmount = 1000;

// Boolean 변수: is/has prefix
const isLoading = true;
const hasPermission = false;
const canEdit = true;

// 상수: UPPER_SNAKE_CASE
const BASE_URL = 'https://api.reservation.com';
const API_ENDPOINTS = {
  RESERVATION: '/api/reservations',
  USER: '/api/users',
};

// Enum 상수
export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
```

#### 함수 네이밍

```typescript
// Event handlers: handle + Target + Event
const handleSubmitButtonClick = () => {};
const handleFormSubmit = () => {};
const handlePasswordReset = () => {};

// Utility functions
const hasUserAccess = (user) => Boolean(user.permissions);
const getUserPermissions = (user) => user.permissions || [];

// Service functions (CRUD)
const fetchUserProfile = async () => {};
const createReservation = async () => {};
const updateReservationStatus = async () => {};
const deleteReservation = async () => {};

// Validation functions
const validateEmail = (email: string) => boolean;
const isValidPhoneNumber = (phone: string) => boolean;
```

#### 타입 정의

```typescript
// Interface: I prefix
interface IUserProfile {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

// DTO Interface
interface ICreateReservationRequest {
  serviceId: number;
  customerId: number;
  reservationDate: string;
  notes?: string;
}

// Response Type: T prefix
type TApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
  statusCode: number;
};

// Enum export
export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}
```

### 파일 구조 패턴

#### 모듈 구조

```
module-name/
├── dto/
│   ├── request/
│   │   ├── create-reservation.dto.ts
│   │   ├── update-reservation.dto.ts
│   │   └── index.ts
│   ├── response/
│   │   ├── reservation-response.dto.ts
│   │   └── index.ts
│   └── index.ts
├── entities/
│   ├── reservation.entity.ts
│   └── index.ts
├── guards/
│   ├── reservation-owner.guard.ts
│   └── index.ts
├── module-name.controller.ts
├── module-name.service.ts
├── module-name.repository.ts (선택적)
├── module-name.module.ts
└── index.ts
```

#### 엔티티 작성 패턴

```typescript
// reservation.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { Service } from '@modules/services/entities/service.entity';
import { ReservationStatus } from '@common/enums';

@Entity('reservations')
export class Reservation extends BaseEntity {
  @Column({ name: 'reservation_code', unique: true })
  reservationCode: string;

  @Column({ name: 'service_id' })
  serviceId: number;

  @Column({ name: 'customer_id', nullable: true })
  customerId: number;

  @Column({ 
    type: 'enum', 
    enum: ReservationStatus, 
    default: ReservationStatus.PENDING 
  })
  status: ReservationStatus;

  @Column({ name: 'reservation_date', type: 'timestamp' })
  reservationDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations
  @ManyToOne(() => User, (user) => user.reservations, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @ManyToOne(() => Service, (service) => service.reservations)
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
```

#### DTO 작성 패턴

```typescript
// dto/request/create-reservation.dto.ts
import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({ 
    description: '서비스 ID',
    example: 1 
  })
  @IsNumber({}, { message: '서비스 ID는 숫자여야 합니다.' })
  serviceId: number;

  @ApiProperty({ 
    description: '예약 날짜 (ISO 8601 형식)',
    example: '2024-12-25T14:00:00Z' 
  })
  @IsDateString({}, { message: '올바른 날짜 형식이 아닙니다.' })
  reservationDate: string;

  @ApiPropertyOptional({ 
    description: '예약 메모',
    example: '2층 화장실 청소 필요' 
  })
  @IsOptional()
  @IsString({ message: '메모는 문자열이어야 합니다.' })
  @Transform(({ value }) => value?.trim())
  notes?: string;
}
```

#### 서비스 작성 패턴

```typescript
// reservation.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/request/create-reservation.dto';
import { ReservationStatus } from '@common/enums';
import { generateReservationCode } from '@common/utils/reservation-code.util';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async createReservation(dto: CreateReservationDto): Promise<Reservation> {
    // Early return pattern 적용
    if (!dto.serviceId) {
      throw new BadRequestException('서비스 ID가 필요합니다.');
    }

    const reservationCode = generateReservationCode();
    
    const reservation = this.reservationRepository.create({
      ...dto,
      reservationCode,
      status: ReservationStatus.PENDING,
    });

    return await this.reservationRepository.save(reservation);
  }

  async findReservationById(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['service', 'customer'],
    });

    if (!reservation) {
      throw new NotFoundException('예약을 찾을 수 없습니다.');
    }

    return reservation;
  }

  // 추가 메서드들...
}
```

### 공통 패턴 및 규칙

#### API 응답 형식

```typescript
// 성공 응답
{
  "success": true,
  "data": { /* 실제 데이터 */ },
  "message": "예약이 성공적으로 생성되었습니다.",
  "statusCode": 201
}

// 에러 응답
{
  "success": false,
  "error": "BadRequestException",
  "message": "잘못된 요청입니다.",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/reservations"
}
```

#### 데코레이터 사용 패턴

```typescript
// 컨트롤러에서 자주 사용하는 패턴
@Controller('reservations')
@ApiTags('예약 관리')
export class ReservationController {
  @Post()
  @ApiOperation({ summary: '새 예약 생성' })
  @ApiResponse({ status: 201, description: '예약 생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  async createReservation(
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: User,
  ): Promise<SuccessResponse<Reservation>> {
    // 구현...
  }

  @Get(':id')
  @Public() // JWT 인증 우회
  @ApiOperation({ summary: '예약 상세 조회' })
  async getReservation(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<Reservation>> {
    // 구현...
  }
}
```

### TypeScript 및 Import 규칙

```typescript
// 좋은 예: 경로 별칭 사용
import { BaseEntity } from '@common/entities/base.entity';
import { ReservationStatus } from '@common/enums';
import { generateReservationCode } from '@common/utils/reservation-code.util';
import { User } from '@modules/users/entities/user.entity';

// 나쁜 예: 상대 경로 남용
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../users/entities/user.entity';
```

### 1차 리팩토링 허용 범위 (✅ 허용)

- **Early Return Pattern**: 조건문을 early return 방식으로 변경
- **네이밍 개선**: 컨벤션에 맞게 변수명, 함수명 수정
- **코드 정리**: 불필요한 중복 제거, 가독성 향상
- **구조 개선**: 함수 분리, 로직 정리 (과도하지 않은 선에서)
- **타입 개선**: TypeScript 타입 정확성 향상
- **에러 메시지 한국어화**: 사용자 친화적 에러 메시지

### 1차 리팩토링 금지사항 (❌ 금지)

- **비즈니스 로직 변경**: 기능적 동작 수정 금지
- **새 파일 생성**: 컴포넌트 분리, 유틸 함수 분리 등
- **상수 추출**: 특정 값을 별도 상수로 분리
- **모듈 분리**: 대규모 구조 변경
- **과도한 리팩토링**: 필요 없어 보이면 하지 않기

## 테스트 전략

### 현재 설정
- Jest에 경로 매핑 설정됨
- 단위 테스트는 `*.spec.ts` 파일에 작성
- 커버리지 리포트 기능 사용 가능
- E2E 테스트는 단순화를 위해 제거

### 테스트 데이터베이스
- 개발 환경과 동일한 PostgreSQL 설정 사용
- 실제 데이터베이스 대상 테스트 (모킹 없음)

## 비즈니스 컨텍스트

개인 서비스 제공업체(예: 홈 관리, 미용 서비스)를 위한 예약 플랫폼입니다. 주요 비즈니스 기능:
- 고객을 위한 공개 예약 인터페이스
- 서비스 제공업체를 위한 관리자 대시보드
- 이중 가격 체계: 정찰제 서비스 + 맞춤형 견적
- 자동화된 알림 시스템
- 포트폴리오 쇼케이스 기능
- 고객 피드백을 위한 리뷰 시스템

이 시스템은 1인 사업자를 위한 단순함과 유지보수 용이성을 우선시합니다.

## 개발 시 주의사항

1. **프로젝트 탐색**: 정보 부족 시 기존 코드베이스에서 패턴 확인
2. **Early Return 패턴**: 조건문은 early return 방식으로 작성 권장
3. **에러 메시지 한국어화**: 사용자 친화적인 한국어 에러 메시지 사용
4. **TypeORM 관계 설정**: 명시적인 JoinColumn과 관계 이름 설정
5. **API 문서화**: Swagger 데코레이터로 API 문서 작성 필수
6. **환경 변수 검증**: 중요한 환경 변수는 validation schema에서 검증
7. **전역 필터 활용**: HttpExceptionFilter가 자동으로 에러 응답 포맷팅
8. **Bull Queue 활용**: 알림 발송 등 비동기 작업은 Queue 시스템 사용

## 주요 엔드포인트 및 권한

### 공개 엔드포인트 (인증 불필요)
```typescript
GET  /api/services           // 서비스 목록 조회
GET  /api/reviews            // 리뷰 목록 조회  
GET  /api/portfolio          // 포트폴리오 조회
GET  /api/faq                // FAQ 조회
GET  /api/calendar/available // 예약 가능 날짜/시간
POST /api/reservations/search // 예약번호로 조회
GET  /health                 // 헬스 체크
```

### 관리자 전용 엔드포인트
```typescript
GET  /api/reservations       // 예약 목록 관리
PUT  /api/quotes/:id         // 견적서 작성
POST /api/services           // 서비스 생성/수정
POST /api/notifications      // 알림 발송
```

### 고객 엔드포인트 (로그인 필요)
```typescript
POST /api/reservations       // 예약 생성
POST /api/quotes             // 견적 요청
POST /api/quotes/:id/approve // 견적 승인
POST /api/reviews            // 리뷰 작성
```

## 환경별 설정

### 개발 환경 (Development)
- 포트: 8000
- 데이터베이스: reservation_dev
- synchronize: true (자동 스키마 동기화)
- 로깅: 활성화
- Swagger UI: 활성화

### 프로덕션 환경 (Production)  
- 포트: 환경변수로 설정
- 데이터베이스: 프로덕션 DB
- synchronize: false (마이그레이션 사용)
- 로깅: 에러만
- Swagger UI: 비활성화

## 문제 해결 가이드

### 일반적인 문제들

1. **Docker 컨테이너 문제**
   ```bash
   # 컨테이너 완전 재시작
   npm run docker:dev:down
   npm run docker:dev:up
   
   # 로그 확인
   npm run docker:dev:logs
   ```

2. **데이터베이스 연결 실패**
   ```bash
   # PostgreSQL 상태 확인
   docker exec -it reservation_postgres_dev pg_isready -U postgres
   
   # 데이터베이스 접속 테스트
   docker exec -it reservation_postgres_dev psql -U postgres -d reservation_dev
   ```

3. **마이그레이션 문제**
   ```bash
   # 마이그레이션 상태 확인
   npm run migration:show
   
   # 마이그레이션 강제 실행
   npm run migration:run
   ```

4. **Redis 연결 문제**
   ```bash
   # Redis 상태 확인
   docker exec -it reservation_redis_dev redis-cli ping
   ```

### 로그 확인 방법

```bash
# 애플리케이션 로그 (Winston)
tail -f logs/error.log
tail -f logs/combined.log

# Docker 서비스 로그
npm run docker:dev:logs postgres
npm run docker:dev:logs redis
```