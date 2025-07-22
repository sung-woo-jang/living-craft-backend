# 빌드 스테이지 - 애플리케이션을 컴파일하는 단계
# Node.js 18 버전의 Alpine Linux 이미지를 기반으로 빌더 컨테이너 생성
FROM node:18-alpine AS builder

# 컨테이너 내부에서 작업할 디렉토리를 /app으로 설정
WORKDIR /app

# package.json과 package-lock.json 파일을 컨테이너로 복사
# 이렇게 먼저 복사하면 의존성이 변경되지 않았을 때 캐시를 활용할 수 있음
COPY package*.json ./

# 프로덕션용 의존성만 설치하고 npm 캐시를 정리
# npm ci는 package-lock.json을 기반으로 정확한 버전을 설치 (npm install보다 안전)
RUN npm ci --only=production && npm cache clean --force

# 소스 코드를 모두 컨테이너로 복사
COPY . .

# TypeScript 코드를 JavaScript로 컴파일
RUN npm run build

# 프로덕션 스테이지 - 실제로 실행될 최종 컨테이너
# 다시 새로운 Node.js Alpine 이미지로 시작 (빌드 도구 등이 없는 깔끔한 환경)
FROM node:18-alpine AS production

# dumb-init 설치 - Docker 컨테이너에서 시그널을 올바르게 처리하기 위한 도구
# 예: Ctrl+C (SIGTERM) 등의 종료 신호를 애플리케이션에 올바르게 전달
RUN apk add --no-cache dumb-init

# 보안을 위해 새로운 사용자 그룹 생성 (root 사용 방지)
# -g 1001: 그룹 ID를 1001로 설정
# -S: 시스템 그룹으로 생성 (일반 사용자가 아닌 서비스용)
RUN addgroup -g 1001 -S nodejs

# nestjs라는 사용자 생성
# -S: 시스템 사용자로 생성
# -u 1001: 사용자 ID를 1001로 설정
RUN adduser -S nestjs -u 1001

# 작업 디렉토리 설정
WORKDIR /app

# package 파일들을 복사 (의존성 설치를 위해)
COPY package*.json ./

# 프로덕션 의존성만 설치 (devDependencies 제외)
RUN npm ci --only=production && npm cache clean --force

# 빌드된 애플리케이션을 builder 스테이지에서 복사
# --from=builder: builder 스테이지에서 파일을 가져옴
# --chown=nestjs:nodejs: 파일 소유자를 nestjs 사용자로 변경
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# uploads 디렉토리가 있다면 복사 (파일 업로드 저장소)
# 2>/dev/null || true: 에러가 발생해도 무시하고 계속 진행
COPY --chown=nestjs:nodejs uploads ./uploads 2>/dev/null || true

# uploads 디렉토리 생성 및 권한 설정
# -p: 상위 디렉토리가 없으면 함께 생성
# chown -R: 재귀적으로 하위 파일/폴더의 소유자도 변경
RUN mkdir -p uploads && chown -R nestjs:nodejs uploads

# root가 아닌 nestjs 사용자로 애플리케이션 실행 (보안 강화)
USER nestjs

# 컨테이너가 3000 포트를 사용한다고 Docker에 알림
EXPOSE 3000

# 환경 변수 설정 - 프로덕션 모드로 실행
ENV NODE_ENV production

# ENTRYPOINT: 컨테이너가 실행될 때 항상 실행되는 명령어
# dumb-init을 통해 시그널을 올바르게 처리
ENTRYPOINT ["dumb-init", "--"]

# CMD: 기본 실행 명령어 (ENTRYPOINT와 함께 실행됨)
# 최종적으로 "dumb-init node dist/main"이 실행됨
CMD ["node", "dist/main"]
