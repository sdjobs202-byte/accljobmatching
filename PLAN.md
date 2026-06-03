# 대학생 ↔ 기업 잡매칭 웹앱 — 기획서 (MVP v1)

> 발주: 커리어웨이(강희승 대표) · 개발: 스마택트(smartact.kr) · 작성일 2026-06-04 · 매칭 방식: **2안(조건필터) + AI 보조 점수**
> 스택: Next.js 15 (App Router) · Supabase(Postgres+Auth+Storage) · Tailwind v4 · Vercel · Claude API
> 컬러: 딥 인디고 `#2436C7` + 라임 `#C6F432` / 화이트 베이스 · 큰 italic 호명 카피

---

## 0. 한 줄 정의
**대학생 400~500명** 규모와 **채용기업 50개사**를, 조건필터로 정렬하고 AI가 적합도 점수·한줄 사유를 붙여 **지원→검토→면접확정→결과**까지 한 흐름으로 잇는 반응형 웹앱.

## 1. 사용자 3역할
| 역할 | 누구 | 핵심 행동 |
|---|---|---|
| **학생(구직자)** | 폴리텍 재학·수료생 | 프로필 등록 → 기업 탐색 → 지원 → 면접확정 확인 |
| **기업(채용담당)** | 50개사 인사담당 | 공고 등록 → 지원서 검토 → 면접 확정/미확정 |
| **관리자** | 운영자(커리어웨이) | 회원·공고 승인, 매칭 현황, 통계 대시보드 |

## 2. 정보구조(IA) — 라우트 맵
```
/                      랜딩 (호명 카피 · 역할별 진입 · 통계 카운터)
/login  /signup        통합 인증 (역할 선택: 학생/기업)
/onboarding            가입 직후 프로필 1스텝 (학생: 학과·역량 / 기업: 회사정보)

[학생]
/companies             기업/공고 목록 (필터: 직무·지역·고용형태 · 카드 그리드)
/companies/[id]        기업 상세 + 공고 상세 + [지원하기]
/apply/[jobId]         지원서 작성 (이력/자소서 + 파일 첨부)
/me                    마이페이지 (지원현황·면접확정·결과 · AI 추천공고)

[기업]
/biz                   기업 대시보드 (내 공고·지원자 수)
/biz/jobs/new          공고 등록/수정
/biz/applicants/[jobId] 지원자 목록 + 적합도 점수 + 서류 확인
/biz/applicants/detail/[appId]  지원서 상세 → 면접확정/미확정

[관리자]
/admin                 KPI 대시보드 (회원·지원·매칭 퍼널)
/admin/users           회원 관리/승인
/admin/jobs            공고 관리/승인
/admin/matches         매칭·면접확정 현황
```

## 3. 핵심 사용자 흐름 (해피패스)
```
학생: 가입 → 프로필 → /companies 필터 → 상세 → 지원(첨부) → [알림톡]
기업: 공고등록 → 지원자 목록(AI 점수순) → 서류검토 → 면접확정 → [알림톡]
학생: /me 에서 "면접확정" 확인 → (v2) 화상면접 링크
```
상태머신(지원서 status): `submitted → reviewing → interview_confirmed | rejected → (v2) hired`

## 4. 매칭 로직 (2안 + AI 보조)
**2-레이어 구조 — 코어는 결정론적 필터, AI는 가산점·설명만.**

1. **조건필터(코어, SQL)**: 직무 카테고리 · 지역 · 고용형태 · 역량 태그 교집합. 빠르고 설명가능.
2. **규칙 점수(0~100)**: 직무일치 40 + 역량태그 겹침 30 + 지역 15 + 고용형태 15. (가중치는 `match_weights` 테이블로 운영자 조절)
3. **AI 보조(Claude API)**: 상위 후보에 대해서만 프로필↔공고를 보내 `fit_score(0~100)` + `reason(한 줄)` 생성. **규칙점수와 평균** 내어 최종 정렬. 비용 절감 위해 (a) 후보 상위 N명만 (b) 결과 캐시(`match_scores` upsert) (c) 프로필/공고 변경 시에만 재계산.
> 비결정성 리스크는 "AI는 보조·캐시·설명용, 정렬의 바닥은 규칙점수"로 차단 → 항상 일관·설명가능.

## 5. 데이터 모델 (요약, 전체는 `supabase/schema.sql`)
- `profiles` (id=auth uid, role: student|company|admin, name, phone, status)
- `student_profiles` (user_id, dept, grad_year, skills[], desired_jobs[], region, resume_url, portfolio_url, intro)
- `companies` (id, owner_id, name, industry, region, logo_url, intro, perks)
- `jobs` (id, company_id, title, job_category, employment_type, region, required_skills[], description, status)
- `applications` (id, job_id, student_id, resume_url, cover_letter, portfolio_url, status, interview_at)
- `match_scores` (job_id, student_id, rule_score, ai_score, final_score, reason, updated_at)
- `notifications` (id, user_id, channel, template, payload, sent_at)
- `match_weights` (singleton 가중치)
- RLS: 학생은 본인 데이터, 기업은 자기 공고/지원자, 관리자는 전체.

## 6. 화면 디자인 원칙
- 화이트 베이스, 큰 **_italic 호명 카피_**("다음 기회를, 너에게"), 충분한 여백.
- 악센트는 인디고(주행동 버튼)·라임(강조/통계)만. 그라데이션 남발 금지.
- 카드 그리드(기업/공고), 상태 배지(지원중/검토중/면접확정), 모바일 우선 반응형.

## 7. 범위(v1) / 다음(v2)
**v1 포함**: 인증·프로필·공고목록/상세·지원·기업검토·면접확정·마이페이지·관리자 대시보드·매칭(2안+AI)·**카카오/문자 알림**.
**v2 이후**: 화상면접 연동, 결제/정산(PG), 3안 풀 자동매칭(벡터 임베딩 랭킹), 통계 고도화.

## 8. 일정 (바이브코딩 기준, 사람 외주 2.5개월 → 압축)
| 주차 | 산출물 |
|---|---|
| W1 | 스키마·인증·디자인시스템·랜딩·기업목록 |
| W2 | 지원흐름·기업검토·면접확정·마이페이지 |
| W3 | 매칭엔진(규칙+AI)·관리자 대시보드·알림 연동 |
| W4 | QA·시드데이터·배포·인수인계 |

## 9. 비용 구조 (대표님 마진 포인트)
견적서 2안 = 공급가 4,427만(VAT 4,870만). 바이브코딩은 사람 맨데이가 소거되므로 **인프라+AI 운영비만 실비**:
- Supabase Free~Pro(₩0~3.5만/월) · Vercel(₩0~Pro) · Claude API(매칭 호출당 수원 단위, 캐시로 월 수만원) · 알림톡(건당 7~15원).
→ **2안 견적가에 납품하되 원가는 1안 이하**, 또는 가격을 낮춰 수주 경쟁력 확보. 둘 다 대표님 선택지.
