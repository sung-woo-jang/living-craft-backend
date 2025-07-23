#!/bin/bash
# Git의 모든 변경사항(staged + unstaged)을 파일로 추출하고 한글 커밋 메시지 작성 안내문을 추가하는 스크립트
# *-lock.* 패턴의 파일은 제외

# Get current date and time for filename
current_date=$(date +"%Y%m%d_%H%M%S")

# Create filename with date
filename="git_diff_${current_date}.txt"

# Export all changes (both staged and unstaged) to file but exclude lock files
echo "=== Unstaged Changes (git diff) ===" > "$filename"
# shellcheck disable=SC2129
git diff -- . ':!*-lock.*' ':!*.lock' ':!*.css' >> "$filename"

echo -e "\n=== Staged Changes (git diff --cached) ===" >> "$filename"
git diff --cached -- . ':!*-lock.*' ':!*.lock' ':!*.css' >> "$filename"

# Add Korean message at the end of the file
#echo -e "\n최근 커밋 메시지 형식을 참고해서 한글로 현재 커밋 메시지를 작성해.\n현재 FSD 아키텍처로 마이그레이션 중이니 만약 개선의 여지가 보이는 부분이 있으면 그 부분도 언급해줘.\n만약 최근 커밋 메시지 파일이 없다면 내가 안 준거니 없는 것 같다고 꼭 얘기해" >> "$filename"

# Check if the file was created successfully
if [ -f "$filename" ]; then
    echo "Git diff has been exported to: $filename"
    echo "File size: $(wc -c < "$filename") bytes"

    # Check if there are any changes at all
    if [ $(wc -c < "$filename") -lt 100 ]; then
        echo "Warning: The diff file is very small. There might not be any changes to track."
    fi
else
    echo "Error: Failed to create diff file"
    exit 1
fi