#!/bin/bash
# Git의 특정 기간 동안 특정 작성자의 변경사항을 파일로 추출하는 스크립트
# *-lock.*, *.lock, *.css 패턴의 파일과 dist 폴더는 제외

# 파라미터 설정
start_date="2025-6-19"
end_date="2025-6-19"
author="sungwoo"

# 제외할 파일 패턴
exclude_patterns="':!*-lock.*' ':!*.lock' ':!*.css' ':!dist/*' ':!*/dist/*'"

# 현재 날짜와 시간을 파일명에 포함
current_datetime=$(date +"%Y%m%d_%H%M%S")
output_file="git_diff_${author}_${start_date}_to_${end_date}_${current_datetime}.txt"

# Git 저장소 체크
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "에러: 현재 디렉토리는 Git 저장소가 아닙니다."
    exit 1
fi

# 파일 헤더 작성
{
    echo "----------------------------------------"
    echo "Git 변경사항(Diff) 내보내기"
    echo "생성 일시: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "조회 기간: $start_date ~ $end_date"
    echo "작성자: $author"
    echo "저장소 경로: $(git rev-parse --show-toplevel)"
    echo "현재 브랜치: $(git branch --show-current)"
    echo "----------------------------------------"
    echo

    # 지정된 기간의 커밋 목록 가져오기
    commit_list=$(git log --author="$author" \
        --after="$start_date 00:00:00" \
        --before="$end_date 23:59:59" \
        --format="%H")

    # 커밋이 있는지 확인
    if [ -z "$commit_list" ]; then
        echo "지정된 기간과 작성자에 대한 커밋이 없습니다."
    else
        # 각 커밋에 대한 diff 추출
        for commit in $commit_list; do
            # 커밋 정보 출력
            echo "=== 커밋: $(git log -1 --format="%h - %s" $commit) ==="
            echo "작성자: $(git log -1 --format="%an <%ae>" $commit)"
            echo "날짜: $(git log -1 --format="%ad" --date=format:"%Y-%m-%d %H:%M:%S" $commit)"
            echo

            # 해당 커밋의 diff 출력 (제외 패턴 적용)
            echo "[ 변경사항 ]"
            eval "git show $commit --name-status -- . $exclude_patterns"
            echo
            echo "[ 상세 Diff ]"
            eval "git show $commit -- . $exclude_patterns"
            echo
            echo "----------------------------------------"
            echo
        done
    fi
} > "$output_file"

# 결과 확인
if [ $? -eq 0 ]; then
    # 조회된 커밋 개수 계산
    commit_count=$(git log --author="$author" \
        --after="$start_date 00:00:00" \
        --before="$end_date 23:59:59" \
        --oneline | wc -l)

    echo "Git 변경사항이 '$output_file'에 저장되었습니다."
    echo "조회된 커밋 수: $commit_count"
    echo "파일 크기: $(wc -c < "$output_file") bytes"

    # 파일 크기가 너무 작은지 확인
    if [ "$(wc -c < "$output_file")" -lt 100 ]; then
        echo "경고: Diff 파일이 너무 작습니다. 추출할 변경사항이 없을 수 있습니다."
    fi
else
    echo "Git 변경사항 추출 중 오류가 발생했습니다."
    exit 1
fi