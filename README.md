# 예약 서비스 플랫폼 백엔드

개인 사업자용 예약 서비스 플랫폼의 백엔드 API 서버입니다.

## 🚀 주요 기능

### 고객용 기능
- **서비스 조회**: 정찰제/견적제 서비스 목록 및 상세 정보
- **예약 시스템**: 정찰제 바로 예약, 견적제 상담 후 예약
- **예약 관리**: 예약번호로 예약 조회 및 관리
- **리뷰 시스템**: 서비스 후 리뷰 작성
- **회원 시스템**: 네이버 OAuth 로그인 지원
- **비회원 예약**: 회원가입 없이 예약 가능

### 관리자용 기능
- **서비스 관리**: 서비스 등록, 수정, 삭제
- **예약 관리**: 예약 확인, 상태 변경
- **견적 관리**: 견적 요청 처리 및 발송
- **일정 관리**: 영업시간, 휴무일 설정
- **고객 관리**: 고객 정보 및 예약 이력
- **통계 대시보드**: 예약, 매출 통계

## 🛠️ 기술 스택

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT + Passport (네이버 OAuth)
- **Queue**: Bull (Redis)
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Containerization**: Docker

## 📋 사전 요구사항

- Node.js 20+
- PostgreSQL 15+
- Redis (선택사항, Bull Queue용)
- Docker & Docker Compose (선택사항)

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 필요한 환경 변수를 설정하세요:

```env
# Application
NODE_ENV=development
PORT=8000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=reservation_db

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Naver OAuth
NAVER_CLIENT_ID=your-client-id
NAVER_CLIENT_SECRET=your-client-secret
NAVER_CALLBACK_URL=http://localhost:8000/api/auth/naver/callback
```

### 3. 데이터베이스 설정

PostgreSQL 데이터베이스를 생성하고 연결을 확인하세요.

### 4. 개발 서버 실행

```bash
# 로컬 개발
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod
```

## 🐳 Docker 사용

### 로컬 개발용 (데이터베이스만)

```bash
docker-compose -f docker-compose.local.yml up -d
```

### 전체 환경 (개발용)

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 프로덕션 배포

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 API 문서

개발 서버 실행 후 다음 URL에서 Swagger API 문서를 확인할 수 있습니다:

```
http://localhost:8000/api/docs
```

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# 테스트 커버리지
npm run test:cov

# E2E 테스트
npm run test:e2e
```

## 📁 프로젝트 구조

```
src/
├── common/                 # 공통 모듈
│   ├── decorators/        # 커스텀 데코레이터
│   ├── dto/               # 공통 DTO
│   ├── entities/          # 기본 엔티티
│   ├── enums/             # 열거형
│   ├── filters/           # 예외 필터
│   ├── guards/            # 가드
│   └── interceptors/      # 인터셉터
├── config/                # 설정 파일
├── database/              # 데이터베이스 설정
├── modules/               # 기능 모듈
│   ├── auth/              # 인증
│   ├── users/             # 사용자 관리
│   ├── services/          # 서비스 관리
│   ├── reservations/      # 예약 관리
│   ├── quotes/            # 견적 관리
│   ├── calendar/          # 일정 관리
│   ├── reviews/           # 리뷰 관리
│   ├── files/             # 파일 관리
│   ├── notifications/     # 알림
│   ├── portfolio/         # 포트폴리오
│   ├── faq/               # FAQ
│   ├── stats/             # 통계
│   └── health/            # 헬스체크
├── app.module.ts          # 루트 모듈
└── main.ts                # 애플리케이션 진입점
```

## 🔧 주요 API 엔드포인트

### 인증
- `POST /api/auth/login` - 이메일 로그인
- `GET /api/auth/naver` - 네이버 OAuth 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/verify` - 비회원 예약 확인

### 서비스
- `GET /api/services` - 서비스 목록
- `GET /api/services/active` - 활성 서비스 목록
- `GET /api/services/:id` - 서비스 상세
- `POST /api/services` - 서비스 생성 (관리자)

### 예약
- `POST /api/reservations` - 예약 생성
- `GET /api/reservations/search` - 예약번호로 조회
- `GET /api/reservations/:id` - 예약 상세
- `PUT /api/reservations/:id` - 예약 수정 (관리자)

### 사용자
- `GET /api/users/me` - 내 정보
- `PUT /api/users/me` - 내 정보 수정
- `GET /api/users` - 사용자 목록 (관리자)

## 🔐 보안

- **JWT 토큰 기반 인증**
- **Role 기반 접근 제어** (고객/관리자)
- **입력 데이터 검증** (class-validator)
- **SQL Injection 방지** (TypeORM 파라미터화)
- **CORS 설정**
- **Rate Limiting** (예정)

## 📈 모니터링

- **헬스체크**: `/api/health`
- **로깅**: Winston 기반 구조화된 로깅
- **에러 추적**: 통합 Exception Filter

## 🚀 배포

### 환경별 설정

1. **개발환경**: `.env.development`
2. **스테이징**: `.env.staging`
3. **프로덕션**: `.env.production`

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# Docker 이미지 빌드
docker build -f Dockerfile.prod -t reservation-backend .

# 배포 (Docker Compose)
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 라이선스

This project is licensed under the MIT License.

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 등록해 주세요.

---

**개발 팀**: 내 서비스 플랫폼 개발팀  
**버전**: 1.0.0  
**마지막 업데이트**: 2024년 12월
