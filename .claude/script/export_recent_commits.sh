#!/bin/bash
# Git 로그 스크립트: 최근 5개 커밋의 상세 정보를 파일로 추출.

# 현재 날짜와 시간을 파일명에 포함
current_datetime=$(date +"%Y%m%d_%H%M%S")
output_file="git_log_${current_datetime}.txt"

# Git 저장소 체크
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "에러: 현재 디렉토리는 Git 저장소가 아닙니다."
    exit 1
fi

# 파일 헤더 작성 및 Git 로그 추출
{
    echo "----------------------------------------"
    echo "Git 커밋 로그 내보내기"
    echo "생성 일시: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "저장소 경로: $(git rev-parse --show-toplevel)"
    echo "현재 브랜치: $(git branch --show-current)"
    echo "----------------------------------------"
    echo

    # 최근 5개의 커밋 로그 추출
    # --author="홍길동\|김철수\|이영희", --author=".*"
    git log -n 5 --pretty=format:"커밋 해시: %h%nAuthor: %an <%ae>%n작성일시: %ad%n브랜치: %D%n%n제목: %s%n%n내용:%n%b%n----------------------------------------" \
        --date=format:"%Y-%m-%d %H:%M:%S" \
        --author="sungwoo" \
        --name-status
} > "$output_file"

# 결과 확인
if [ $? -eq 0 ]; then
    echo "Git 로그가 '$output_file'에 저장되었습니다."
else
    echo "Git 로그 추출 중 오류가 발생했습니다."
    exit 1
fi