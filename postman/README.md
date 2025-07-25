# 🚀 Reservation Service API Documentation

예약 서비스 플랫폼의 완전한 Postman API 컬렉션 및 환경 설정 가이드입니다.

## 📋 목차

- [📦 컬렉션 구성](#-컬렉션-구성)
- [🌍 환경 설정](#-환경-설정)
- [🔧 설치 및 설정](#-설치-및-설정)
- [🎯 사용 방법](#-사용-방법)
- [🔐 인증 가이드](#-인증-가이드)
- [📊 API 엔드포인트 개요](#-api-엔드포인트-개요)
- [🧪 테스트 가이드](#-테스트-가이드)
- [🔍 문제 해결](#-문제-해결)

## 📦 컬렉션 구성

### 메인 컬렉션

| 컬렉션 | 설명 | 주요 기능 |
|--------|------|-----------|
| **Auth.postman_collection.json** | 인증 관리 | 로그인, 회원가입, 마스터키 로그인(0000) |
| **Users.postman_collection.json** | 사용자 관리 | 사용자 CRUD, 프로필 관리, 권한 설정 |
| **Quotes.postman_collection.json** | 견적 관리 | 견적 요청, 작성, 승인, 거절 |
| **Reviews.postman_collection.json** | 리뷰 관리 | 리뷰 작성, 조회, 관리자 응답 |
| **Calendar.postman_collection.json** | 캘린더 관리 | 예약 가능 시간, 영업시간 설정, 차단 날짜 |
| **FAQ.postman_collection.json** | FAQ 관리 | FAQ CRUD, 카테고리별 조회 |
| **Portfolio.postman_collection.json** | 포트폴리오 관리 | 작업 사례 CRUD, 순서 관리 |
| **Notifications.postman_collection.json** | 알림 관리 | 템플릿 관리, 발송 이력, SMS/이메일 |
| **Files.postman_collection.json** | 파일 관리 | 이미지 업로드, 문서 관리, 다중 파일 지원 |
| **Stats.postman_collection.json** | 통계 분석 | 대시보드 통계, 매출 분석, 고객 분석 |

## 🌍 환경 설정

### 제공되는 환경

| 환경 | 파일명 | 용도 | API URL |
|------|--------|------|---------|
| **Development** | `Development.postman_environment.json` | 로컬 개발 | `http://localhost:3000` |
| **Test** | `Test.postman_environment.json` | 테스트 서버 | `https://api-test.reservation-service.com` |
| **Production** | `Production.postman_environment.json` | 프로덕션 | `https://api.reservation-service.com` |

### 주요 환경 변수

```json
{
  "API_URL": "서버 URL",
  "ACCESS_TOKEN": "JWT 액세스 토큰 (자동 설정)",
  "CUSTOMER_EMAIL": "테스트 고객 이메일",
  "CUSTOMER_PASSWORD": "테스트 고객 비밀번호",
  "MASTER_KEY": "개발용 마스터키 (0000)",
  "TEST_RESERVATION_CODE": "테스트 예약 코드",
  "TEST_PHONE": "테스트 전화번호"
}
```

## 🔧 설치 및 설정

### 1. Postman에서 컬렉션 가져오기

**컬렉션 파일들:**
- `Auth.postman_collection.json`
- `Users.postman_collection.json`
- `Quotes.postman_collection.json`
- `Reviews.postman_collection.json`
- `Calendar.postman_collection.json`
- `FAQ.postman_collection.json`
- `Portfolio.postman_collection.json`
- `Notifications.postman_collection.json`
- `Files.postman_collection.json`
- `Stats.postman_collection.json`

**환경 파일들:**
- `environments/Development.postman_environment.json`
- `environments/Test.postman_environment.json`
- `environments/Production.postman_environment.json`

### 2. 환경 선택

- Postman 우상단에서 환경 선택
- 개발: `Development Environment`
- 테스트: `Test Environment`
- 프로덕션: `Production Environment`

## 🎯 사용 방법

### 기본 워크플로우

1. **환경 설정**: Development Environment 선택

2. **인증 (필수 첫 단계)**: Auth 컬렉션 → "로그인" 또는 "마스터키 로그인 (0000)" 실행 → ACCESS_TOKEN 자동 저장됨

3. **API 테스트**: 원하는 컬렉션에서 API 엔드포인트 실행

### 빠른 시작 예제

```bash
# 1. 마스터키로 로그인
POST /api/auth/login
{
  "email": "admin@exampl/e.com",
  "password": "0000"
}

# 2. 서비스 목록 조회 (공개 API)
GET /api/services

# 3. 예약 생성 (인증 필요)
POST /api/reservations
{
  "serviceId": 1,
  "reservationDate": "2025-07-25T14:00:00Z",
  "customerName": "김고객",
  "customerPhone": "010-1111-1111"
}
```

## 🔐 인증 가이드

### 인증 방식

| 방식 | 용도 | 설명 |
|------|------|------|
| **JWT Bearer Token** | 대부분의 API | 로그인 후 자동으로 헤더에 설정됨 |
| **공개 API** | 일부 조회 API | 인증 불필요 (`@Public()` 데코레이터) |
| **게스트 토큰** | 비회원 예약 조회 | 예약번호 + 전화번호로 임시 토큰 발급 |

### 마스터키 기능 (개발 전용)

```json
{
  "email": "any@email.com",
  "password": "0000"
}
```

- **어떤 이메일이든** 비밀번호 `0000`으로 관리자 권한 로그인 가능
- 개발 및 테스트 환경에서만 사용
- 프로덕션에서는 비활성화됨

### 인증이 필요한 API vs 공개 API

**🔒 인증 필요 (관리자 전용)**
- 예약 관리, 통계 조회, 알림 템플릿 관리
- 사용자 관리, 서비스 설정, 파일 관리

**🌐 공개 API (인증 불필요)**
- 서비스 목록, 리뷰 조회, FAQ 조회
- 포트폴리오 조회, 예약 가능 시간 확인

**👤 고객 권한 필요**
- 예약 생성, 리뷰 작성, 견적 승인

## 📊 API 엔드포인트 개요

### 인증 (Auth)
```http
POST   /api/auth/login              # 일반 로그인
POST   /api/auth/login              # 마스터키 로그인 (password: "0000")
GET    /api/auth/profile            # 프로필 조회
POST   /api/auth/register           # 회원가입
GET    /api/auth/naver              # 네이버 OAuth
POST   /api/auth/verify-guest       # 비회원 인증
```

### 예약 관리 (Reservations)
```http
GET    /api/reservations            # 예약 목록 (관리자)
POST   /api/reservations            # 예약 생성
GET    /api/reservations/:id        # 예약 상세
PUT    /api/reservations/:id        # 예약 수정
POST   /api/reservations/search     # 예약 조회 (공개)
```

### 견적 관리 (Quotes)
```http
GET    /api/quotes                  # 견적 목록 (관리자)
POST   /api/quotes                  # 견적 요청 (고객)
PUT    /api/quotes/:id              # 견적서 작성 (관리자)
POST   /api/quotes/:id/approve      # 견적 승인 (고객)
POST   /api/quotes/:id/reject       # 견적 거절 (고객)
```

### 통계 (Stats)
```http
GET    /api/stats/dashboard         # 대시보드 통계
GET    /api/stats/realtime          # 실시간 통계
GET    /api/stats/reservations/monthly    # 월별 예약 통계
GET    /api/stats/services/popularity     # 서비스 인기도
GET    /api/stats/customers/analysis      # 고객 분석
GET    /api/stats/revenue/trends           # 매출 트렌드
```

## 🧪 테스트 가이드

### 자동화된 테스트

각 컬렉션에는 **Test Scripts**가 포함되어 있습니다:

```javascript
// 로그인 후 토큰 자동 저장
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.accessToken) {
        pm.environment.set('ACCESS_TOKEN', response.data.accessToken);
    }
}
```

### 테스트 시나리오

#### 1. 기본 예약 플로우
```
1. 마스터키 로그인 → 2. 서비스 목록 조회 → 3. 예약 생성 → 4. 예약 확인
```

#### 2. 견적 요청 플로우
```
1. 고객 회원가입 → 2. 로그인 → 3. 견적 요청 → 4. 관리자 로그인 → 5. 견적서 작성 → 6. 고객 승인
```

#### 3. 리뷰 작성 플로우
```
1. 예약 완료 → 2. 고객 로그인 → 3. 리뷰 작성 → 4. 관리자 응답
```

### Collection Runner 사용

1. 컬렉션 우클릭 → `Run collection`
2. 환경 선택: `Development Environment`
3. 실행할 요청 선택
4. `Run` 버튼 클릭

## 🔍 문제 해결

### 일반적인 문제들

#### 1. 401 Unauthorized 오류
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "인증이 필요합니다."
}
```

**해결 방법:**
- Auth 컬렉션에서 로그인 먼저 실행
- ACCESS_TOKEN이 환경변수에 저장되었는지 확인
- 토큰 만료 시 다시 로그인

#### 2. 환경변수 문제
```
{{API_URL}} 또는 {{ACCESS_TOKEN}}이 해석되지 않음
```

**해결 방법:**
- 올바른 환경이 선택되었는지 확인
- 환경변수가 정확히 설정되었는지 확인
- Postman 재시작

#### 3. 서버 연결 오류
```
Could not get any response
```

**해결 방법:**
- 로컬 서버가 실행 중인지 확인 (`npm run start:dev`)
- API_URL이 올바른지 확인
- 방화벽 설정 확인

#### 4. 마스터키 로그인 실패

**확인사항:**
- 개발 환경에서만 작동 (프로덕션 비활성화)
- 정확히 `"0000"` 문자열 사용
- 서버에서 마스터키 기능이 활성화되어 있는지 확인

### API 응답 형식

#### 성공 응답
```json
{
  "success": true,
  "data": {},
  "message": "요청이 성공적으로 처리되었습니다.",
  "statusCode": 200
}
```

#### 오류 응답
```json
{
  "success": false,
  "error": "BadRequestException",
  "message": "잘못된 요청입니다.",
  "statusCode": 400,
  "timestamp": "2025-07-23T23:00:00.000Z",
  "path": "/api/reservations"
}
```

## 📈 고급 사용법

### 1. 변수 활용

```javascript
// Pre-request Script에서 동적 데이터 생성
pm.environment.set("CURRENT_DATE", new Date().toISOString());
pm.environment.set("RANDOM_EMAIL", `test${Math.random()}@example.com`);
```

### 2. 체인 테스트

```javascript
// Test Script에서 다음 요청을 위한 데이터 저장
const response = pm.response.json();
pm.environment.set("CREATED_RESERVATION_ID", response.data.id);
```

### 3. 조건부 테스트

```javascript
// 환경에 따른 다른 동작
if (pm.environment.get("ENVIRONMENT") === "production") {
    // 프로덕션에서는 실제 데이터 사용 금지
    pm.test("Should not run in production", function () {
        pm.expect(false).to.be.true;
    });
}
```

## 🔄 업데이트 가이드

### 새로운 API 추가 시

1. 해당 컬렉션에 새 요청 추가
2. 적절한 폴더에 분류
3. 예시 응답 추가
4. 테스트 스크립트 작성
5. README 업데이트

### 환경변수 추가 시

1. 모든 환경 파일에 동일하게 추가
2. 보안이 중요한 변수는 `type: "secret"` 설정
3. 설명 추가: `"description": "변수 설명"`

## 📞 지원

- **개발자 문의**: 프로젝트 관리자에게 연락
- **버그 리포트**: GitHub Issues 활용  
- **기능 요청**: 개발팀 논의 후 반영

---

**마지막 업데이트**: 2025년 7월 23일  
**버전**: v1.0.0  
**호환성**: NestJS v8+, Postman v10+