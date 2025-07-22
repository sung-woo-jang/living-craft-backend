# 예약 서비스 플랫폼 백엔드

1인 사업자용 예약 서비스 플랫폼의 백엔드 API 서버입니다.

## 📋 프로젝트 개요

개인 사업자가 현장 방문형 서비스의 온라인 예약을 받고 관리할 수 있는 플랫폼입니다.

### 주요 기능

- 🔐 **인증 시스템**: JWT 기반 인증, 네이버 OAuth, 비회원 예약 지원
- 📅 **예약 관리**: 정찰제/견적제 서비스, 실시간 예약 가능 시간 확인
- 📊 **관리자 대시보드**: 예약 현황, 견적 관리, 고객 관리
- 📱 **알림 시스템**: SMS/이메일 자동 발송
- ⭐ **리뷰 시스템**: 고객 만족도 관리
- 🎨 **포트폴리오**: 작업 사례 관리

## 🛠️ 기술 스택

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT, Passport
- **Documentation**: Swagger
- **Validation**: class-validator
- **Testing**: Jest
- **Containerization**: Docker

## 🚀 시작하기

### 환경 요구사항

- Node.js 18+
- PostgreSQL 15+
- Redis (선택사항, 세션/캐시용)

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/your-username/reservation-backend.git
cd reservation-backend
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
cp .env.example .env
# .env 파일을 수정하여 데이터베이스 및 기타 설정을 입력
```

4. **데이터베이스 설정**
```bash
# Docker로 PostgreSQL 실행 (개발용)
docker-compose -f docker-compose.dev.yml up -d postgres-dev

# 또는 로컬 PostgreSQL 사용
# createdb reservation_dev
```

5. **데이터베이스 마이그레이션 및 시드 데이터**
```bash
# 데이터베이스 동기화 (개발 환경에서만)
npm run start:dev

# 시드 데이터 실행
npm run seed:run
```

6. **개발 서버 실행**
```bash
npm run start:dev
```

서버가 실행되면 다음 주소로 접속 가능합니다:
- API 서버: http://localhost:3000
- Swagger 문서: http://localhost:3000/api/docs
- 헬스체크: http://localhost:3000/health

### Docker로 실행

```bash
# 전체 스택 실행 (프로덕션)
docker-compose up -d

# 개발용 데이터베이스만 실행
docker-compose -f docker-compose.dev.yml up -d
```

## 📚 API 문서

개발 환경에서는 Swagger UI를 통해 API 문서를 확인할 수 있습니다.

- **Swagger UI**: http://localhost:3000/api/docs

### 주요 API 엔드포인트

```
인증
POST   /api/auth/admin/login     # 관리자 로그인
POST   /api/auth/verify          # 비회원 예약 인증
GET    /api/auth/me              # 현재 사용자 정보

서비스
GET    /api/services             # 서비스 목록
POST   /api/services             # 서비스 생성 (관리자)
GET    /api/services/:id         # 서비스 상세

예약
POST   /api/reservations         # 예약 생성
GET    /api/reservations         # 예약 목록 (관리자)
GET    /api/reservations/search  # 예약번호로 조회

견적
POST   /api/quotes               # 견적 요청
PUT    /api/quotes/:id           # 견적 작성 (관리자)
POST   /api/quotes/:id/approve   # 견적 승인

캘린더
GET    /api/calendar/available   # 예약 가능 날짜
GET    /api/calendar/slots       # 시간 슬롯 조회
```

## 🗄️ 데이터베이스 스키마

### 주요 테이블

- **users**: 사용자 정보 (관리자, 고객)
- **services**: 서비스 정보 (정찰제/견적제)
- **reservations**: 예약 정보
- **quotes**: 견적 정보
- **reviews**: 리뷰 정보
- **calendar_settings**: 영업시간 설정
- **notification_templates**: 알림 템플릿

### ERD

```
users (1) ----< (N) reservations (1) ----< (1) quotes
                    |
                    v (1)
                  reviews
                    
services (1) ----< (N) reservations
         |
         v (1)
    service_images

calendar_settings
blocked_dates
portfolio_images
notification_templates
notification_logs
faqs
```

## 🧪 테스트

```bash
# 단위 테스트 실행
npm run test

# 테스트 커버리지 확인
npm run test:cov

# E2E 테스트 실행
npm run test:e2e

# 테스트 감시 모드
npm run test:watch
```

## 📦 빌드 및 배포

### 개발 빌드

```bash
npm run build
```

### 프로덕션 배포

```bash
# Docker를 사용한 배포
docker-compose up -d

# PM2를 사용한 배포
npm install -g pm2
npm run build
pm2 start dist/main.js --name reservation-api
```

### 환경별 설정

- **개발**: `.env` 또는 `.env.local`
- **테스트**: `.env.test`
- **프로덕션**: 환경 변수 또는 시크릿 관리 시스템

## 🔧 설정 옵션

### 주요 환경 변수

```bash
# 데이터베이스
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=reservation_user
DB_PASSWORD=reservation_password
DB_DATABASE=reservation_db

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# 네이버 OAuth
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

# 관리자 계정
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123!
```

## 📱 알림 시스템

### SMS 발송 (네이버 클라우드 플랫폼 SENS)

```bash
NCP_ACCESS_KEY=your-ncp-access-key
NCP_SECRET_KEY=your-ncp-secret-key
NCP_SERVICE_ID=your-service-id
NCP_CALLING_NUMBER=010-1234-5678
```

### 이메일 발송 (네이버 클라우드 플랫폼)

```bash
NCP_EMAIL_ACCESS_KEY=your-email-access-key
NCP_EMAIL_SECRET_KEY=your-email-secret-key
```

## 🔐 보안 고려사항

- JWT 토큰 기반 인증
- 비밀번호 해싱 (bcrypt)
- CORS 설정
- API Rate Limiting (프로덕션에서 권장)
- 입력 데이터 검증 및 필터링
- SQL 인젝션 방지 (TypeORM 사용)

## 📈 모니터링 및 로깅

- 헬스체크 엔드포인트 (`/health`)
- 요청/응답 로깅
- 에러 로깅 및 트래킹
- 성능 메트릭 수집

## 🤝 기여 가이드

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

### 코딩 컨벤션

- ESLint + Prettier 사용
- TypeScript strict 모드
- 의미있는 커밋 메시지
- 테스트 코드 작성

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원 및 문의

- **이슈 리포트**: [GitHub Issues](https://github.com/your-username/reservation-backend/issues)
- **이메일**: your-email@example.com
- **문서**: [위키](https://github.com/your-username/reservation-backend/wiki)

## 📋 할일 목록

- [ ] 네이버 OAuth 완전 구현
- [ ] 파일 업로드 API 구현
- [ ] 실시간 알림 (WebSocket)
- [ ] 통계 대시보드 API
- [ ] API Rate Limiting
- [ ] 캐싱 시스템 (Redis)
- [ ] 로깅 시스템 고도화
- [ ] CI/CD 파이프라인 구축

---

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (NestJS)      │◄──►│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  External APIs  │
                       │  - Naver OAuth  │
                       │  - SMS/Email    │
                       └─────────────────┘
```

이 프로젝트는 확장 가능하고 유지보수가 용이한 구조로 설계되었습니다. 궁금한 점이 있으시면 언제든 이슈를 등록해 주세요!
