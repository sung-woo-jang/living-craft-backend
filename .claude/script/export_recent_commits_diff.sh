#!/bin/bash
# Git 로그 스크립트: 최근 N개 커밋의 diff 정보를 파일로 추출

# 파라미터 설정 (스크립트 내에 직접 숫자 지정)
commit_count=6  # 여기서 원하는 커밋 개수를 직접 지정

# 현재 날짜와 시간을 파일명에 포함
current_datetime=$(date +"%Y%m%d_%H%M%S")
output_file="git_recent_${commit_count}_commits_${current_datetime}.txt"

# Git 저장소 체크
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "에러: 현재 디렉토리는 Git 저장소가 아닙니다."
    exit 1
fi

# 파일 헤더 작성
{
    echo "----------------------------------------"
    echo "Git 최근 ${commit_count}개 커밋 diff 내보내기"
    echo "생성 일시: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "저장소 경로: $(git rev-parse --show-toplevel)"
    echo "현재 브랜치: $(git branch --show-current)"
    echo "----------------------------------------"
    echo
} > "$output_file"

# 최근 N개 커밋 해시 가져오기
commit_hashes=$(git log -n "$commit_count" --pretty=format:"%h")

# 각 커밋에 대한 diff 추출
for commit_hash in $commit_hashes; do
    # 커밋 정보 추출
    commit_info=$(git show --pretty=format:"커밋 해시: %h%nAuthor: %an <%ae>%n작성일시: %ad%n브랜치: %D%n%n제목: %s%n%n내용:%n%b" --date=format:"%Y-%m-%d %H:%M:%S" "$commit_hash" | head -n 20)

    {
        echo "$commit_info"
        echo "----------------------------------------"
        echo "변경사항 (Diff):"
        echo "----------------------------------------"
        # diff 추출 (lock 파일 및 CSS 파일 제외)
        git show "$commit_hash" -- . ':!*-lock.*' ':!*.lock' ':!*.css'
        echo "========================================================================"
        echo
    } >> "$output_file"
done

# 결과 확인
if [ -f "$output_file" ]; then
    echo "Git 최근 ${commit_count}개 커밋의 diff가 '$output_file'에 저장되었습니다."
    echo "파일 크기: $(wc -c < "$output_file") 바이트"

    # 너무 작은 파일 체크
    if [ "$(wc -c < "$output_file")" -lt 100 ]; then
        echo "경고: diff 파일이 매우 작습니다. 변경사항이 없을 수 있습니다."
    fi
else
    echo "Git diff 추출 중 오류가 발생했습니다."
    exit 1
fi