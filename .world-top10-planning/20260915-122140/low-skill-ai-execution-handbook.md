# 저숙련 AI 5단계 실행 가이드북 (Low-Skill AI Execution Handbook)

본 문서는 경험이 적은 초급 AI 엔지니어도 자의적 판단이나 재기획 없이 개발을 완수할 수 있도록 작성된 실전 지침서입니다.

## 1. 3대 절대 원칙
1. **단일 작업 단일 파일 변경:** 한 번에 여러 파일을 수정하지 말고, 작업카드에 지정된 파일만 수정한다.
2. **미세 단계 즉시 검증:** 12개 미세 단계(STEP-01~12)마다 즉시 테스트 명령을 실행해 녹색 출력을 확인한다.
3. **실패 시 즉시 복구:** 테스트 실패 시 코드를 임의로 덧붙이지 말고 `rollback.md` 명령으로 직전 상태로 복귀한다.

## 2. 첫 작업 따라하기 (First Task Walkthrough)
- 대상 작업: `TASK-1-001` (환경 기준선 고정)
- 실행 폴더: `C:/Users/Admin/.gemini/antigravity/scratch/paper-ai-summarizer`
- 실행 명령: `npm test`
- 기대 출력: `PASS`
