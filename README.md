# 대학생-기업 잡매칭 웹앱 (MVP v1)

발주: ACCL AI 커리어콘텐츠 연구소 · 개발: 스마택트. 대학생 ↔ 기업 채용 매칭 플랫폼. 조건필터(2안) + Claude AI 보조 점수.
기획 전문은 [PLAN.md](./PLAN.md), DB 스키마는 [supabase/schema.sql](./supabase/schema.sql).

## 스택
Next.js 15 (App Router) · Supabase(Postgres·Auth·Storage) · Tailwind v4 · Vercel · Claude API

## 실행
```bash
npm install
cp .env.example .env.local   # 비워두면 목업 데이터로 동작
npm run dev                  # http://localhost:3000
```

## 현재 동작하는 화면 (목업 데이터)
| 경로 | 내용 |
|---|---|
| `/` | 랜딩 (호명 카피·통계·역할 진입) |
| `/companies` | 공고 목록 — **적합도순 정렬 + AI 코멘트** |
| `/companies/[id]` | 기업·공고 상세 → 지원 |
| `/apply/[jobId]` | 지원서 작성 (이력서·자소서·포폴) |
| `/me` | 마이페이지 (지원현황·면접확정·추천공고) |
| `/biz/applicants/[jobId]` | 기업용 지원자 검토 (점수순·면접확정) |
| `/admin` | 관리자 KPI·매칭 퍼널 |
| `/login` `/signup` | 인증 (Supabase Auth 연동 자리) |

## 매칭 엔진 ([src/lib/matching.ts](./src/lib/matching.ts))
- **규칙 점수(결정론)**: 직무40 + 역량30 + 지역15 + 형태15, 가중치는 `match_weights`로 조절.
- **AI 보조(Claude)**: 상위 후보만 호출 → `fit_score` + 한 줄 사유, 규칙점수와 평균. 캐시(`match_scores`)로 비용 최소화. 키 없으면 규칙 기반 폴백 사유.

## 남은 연결 작업 (다음 단계)
1. Supabase 프로젝트 생성 → `schema.sql` 실행 → `.env.local` 채우기
2. Auth(이메일·카카오 OAuth) + 미들웨어 세션 + RLS 검증
3. 목업 → 실제 쿼리 교체 (`src/lib/mock.ts` 대체)
4. Storage 업로드(이력서/포폴), Claude 매칭 서버액션, 알림톡 연동
5. `npm run typecheck` 통과 후 Vercel 배포
