# 📮 Postman API 테스트 컬렉션

예약 서비스 플랫폼의 모든 API를 테스트할 수 있는 Postman 컬렉션 모음입니다.

## 🗂️ 컬렉션 구성

### 핵심 API 컬렉션
- **Auth.postman_collection.json** - 인증 관리 (로그인, 회원가입, 프로필)
- **Reservations.postman_collection.json** - 예약 관리 (생성, 조회, 상태 업데이트)
- **Services.postman_collection.json** - 서비스 관리 (목록, 상세, 생성)
- **Users.postman_collection.json** - 사용자 관리 (목록, 프로필, 생성)
- **Quotes.postman_collection.json** - 견적 관리 (요청, 승인, 작성)
- **Reviews.postman_collection.json** - 리뷰 관리 (작성, 답글, 조회)

### 부가 기능 컬렉션
- **Calendar.postman_collection.json** - 예약 가능 시간 관리
- **Portfolio.postman_collection.json** - 포트폴리오 관리
- **FAQ.postman_collection.json** - FAQ 관리
- **Files.postman_collection.json** - 파일 업로드
- **Notifications.postman_collection.json** - 알림 관리
- **Stats.postman_collection.json** - 통계 조회
- **Health.postman_collection.json** - 헬스체크

## 🌍 환경 설정

### 지원하는 환경
```
environments/
├── Development.postman_environment.json    # 개발 환경
├── Staging.postman_environment.json        # 스테이징 환경  
├── Production.postman_environment.json     # 프로덕션 환경
└── Test.postman_environment.json          # 테스트 환경
```

### 환경별 접속 정보

| 환경 | API URL | 설명 | 데이터베이스 포트 |
|------|---------|------|------------------|
| **개발** | `http://localhost:8000` | 로컬 개발 서버 | 5432 |
| **스테이징** | `http://localhost:8080` | nginx 프록시 통합 환경 | 5433 |
| **프로덕션** | `https://api.your-domain.com` | 실제 서비스 환경 | - |
| **테스트** | `http://localhost:8000` | 테스트용 환경 | 5432 |

## 🚀 빠른 시작

### 1. Postman 컬렉션 가져오기

1. **Postman 실행**
2. **Import** 버튼 클릭
3. **폴더 전체 선택**하여 모든 컬렉션 가져오기
   ```
   postman/ 폴더 전체 드래그 앤 드롭
   ```

### 2. 환경 설정

1. **Environment** 드롭다운에서 원하는 환경 선택
   - 개발: `Development Environment`
   - 스테이징: `Staging Environment` 
   - 프로덕션: `Production Environment`

2. **환경별 기본 설정 확인**
   ```json
   // 개발 환경
   API_URL: http://localhost:8000
   ADMIN_EMAIL: admin@example.com
   ADMIN_PASSWORD: admin123
   
   // 스테이징 환경  
   API_URL: http://localhost:8080
   ADMIN_EMAIL: admin@staging.reservation.com
   ADMIN_PASSWORD: staging_admin123
   ```

### 3. 인증 토큰 설정

#### 방법 1: 자동 설정 (권장)
1. **Auth 컬렉션** → **관리자 로그인** 실행
2. 성공 시 `ACCESS_TOKEN` 자동 저장됨
3. 이후 인증이 필요한 모든 API에서 토큰 자동 사용

#### 방법 2: 수동 설정
1. 로그인 API 실행 후 응답에서 토큰 복사
2. 환경 변수에서 `ACCESS_TOKEN` 값 수동 입력

## 📋 API 테스트 시나리오

### 🔐 기본 인증 플로우
```
1. 관리자 로그인 → 토큰 획득
2. 프로필 조회 → 인증 확인
3. 사용자 목록 조회 → 권한 확인
```

### 📅 예약 관리 플로우
```
1. 서비스 목록 조회 → 사용 가능한 서비스 확인
2. 새 예약 생성 → 예약 정보 입력
3. 예약 상세 조회 → 생성된 예약 확인
4. 예약 상태 업데이트 → 확정/완료 처리
```

### 💰 견적 요청 플로우
```
1. 견적 요청 → 고객이 견적 요청
2. 견적서 작성 → 관리자가 견적서 작성
3. 견적 승인 → 고객이 견적 승인
4. 예약 자동 생성 → 견적 승인 시 예약 전환
```

### ⭐ 리뷰 관리 플로우
```
1. 완료된 예약 조회 → 리뷰 가능한 예약 확인
2. 리뷰 작성 → 고객이 리뷰 작성
3. 리뷰 답글 → 관리자가 답글 작성
4. 리뷰 목록 조회 → 전체 리뷰 현황 확인
```

## 🔧 컬렉션별 주요 기능

### 🔑 Auth (인증)
- **관리자 로그인**: 관리자 계정 인증
- **사용자 로그인**: 일반 고객 인증  
- **회원가입**: 새 고객 계정 생성
- **프로필 조회**: 현재 로그인 사용자 정보
- **네이버 OAuth**: 소셜 로그인 URL 조회

### 📝 Reservations (예약)
- **예약 목록**: 페이징 조회, 상태별 필터링
- **예약 생성**: 정찰제/견적제 서비스 예약
- **예약 상세**: 특정 예약 정보 조회
- **상태 업데이트**: pending → confirmed → completed
- **예약 검색**: 예약번호로 공개 검색
- **내 예약**: 고객 본인 예약만 조회
- **오늘 예약**: 당일 예약 목록 (관리자용)

### 🛠️ Services (서비스)
- **서비스 목록**: 공개 API, 활성 서비스만 조회
- **서비스 상세**: 가격, 설명, 카테고리 정보
- **서비스 생성**: 관리자가 새 서비스 등록

### 👥 Users (사용자)
- **사용자 목록**: 관리자가 전체 사용자 조회
- **사용자 상세**: 특정 사용자 정보 조회
- **사용자 생성**: 관리자가 사용자 계정 생성
- **프로필 조회**: 본인 프로필 정보 조회
- **프로필 업데이트**: 개인정보 수정

### 💰 Quotes (견적)
- **견적 목록**: 견적 요청 목록 조회
- **견적 요청**: 고객이 견적 요청
- **견적서 작성**: 관리자가 견적서 작성
- **견적 승인/거절**: 고객이 견적 승인 또는 거절
- **견적서 조회**: 작성된 견적서 내용 확인

### ⭐ Reviews (리뷰)
- **리뷰 목록**: 공개 리뷰 목록 조회
- **리뷰 작성**: 완료된 예약에 대한 리뷰 작성
- **비회원 리뷰**: 예약번호로 비회원 리뷰 작성
- **리뷰 답글**: 관리자가 리뷰에 답글 작성
- **전체 리뷰**: 관리자용 모든 리뷰 조회

## 🔍 문제 해결

### 인증 관련 문제
```bash
# 401 Unauthorized 오류
1. 관리자 로그인 API 다시 실행
2. ACCESS_TOKEN 환경 변수 확인
3. 토큰 만료 시 재로그인 필요

# 403 Forbidden 오류  
1. 사용자 권한 확인 (관리자 vs 고객)
2. 올바른 계정으로 로그인했는지 확인
```

### 환경 설정 문제
```bash
# Connection refused 오류
1. 백엔드 서버 실행 상태 확인
2. 포트 번호 확인 (개발: 8000, 스테이징: 8080)
3. 환경 변수 API_URL 값 확인

# 개발 환경
npm run start:dev

# 스테이징 환경
npm run docker:staging:up
npm run start:staging
```

### 데이터 관련 문제
```bash
# 서비스/사용자 없음 오류
1. 시드 데이터 실행 확인
npm run seed:run          # 개발환경
npm run seed:staging      # 스테이징환경

2. 데이터베이스 연결 상태 확인
```

## 📊 환경별 테스트 권장사항

### 개발 환경 (Development)
- ✅ 모든 API 자유롭게 테스트
- ✅ 데이터 생성/수정/삭제 가능
- ✅ 디버깅 정보 확인 가능
- ✅ Swagger UI 활용 (`http://localhost:8000/api/docs`)

### 스테이징 환경 (Staging)  
- ✅ 프로덕션과 동일한 구조 테스트
- ✅ nginx 프록시 동작 확인
- ✅ 파일 업로드/다운로드 테스트
- ⚠️ 실제 알림 발송 비활성화됨
- ⚠️ 테스트 데이터만 사용 권장

### 프로덕션 환경 (Production)
- ⚠️ 읽기 전용 API만 테스트 권장
- ⚠️ 실제 데이터 생성 시 주의
- ⚠️ Rate limiting 적용됨
- ❌ 대량 테스트 금지

## 📞 지원

- **API 문서**: http://localhost:8000/api/docs (개발환경)
- **스테이징 API 문서**: http://localhost:8080/api/docs  
- **이슈 보고**: GitHub Issues
- **문의**: admin@reservation.com

---

**업데이트**: 2025.01.31  
**버전**: 2.0.0 (GET/POST 전용 간소화 버전)