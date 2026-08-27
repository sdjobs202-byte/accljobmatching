-- 기업 담당자·수요조사 정보 (운영 전용)
-- 실행: Supabase SQL Editor 에 붙여넣기. seed-companies-2026.mjs 실행 전에 먼저 돌린다.
--
-- 왜 companies 에 컬럼을 붙이지 않았나:
--   companies 는 `create policy "companies read" ... using (true)` 라 전 컬럼이 비로그인
--   방문자에게도 공개된다. 담당자 실명·직함·연락처를 거기 넣으면 그대로 공개되고
--   크롤링 대상이 된다. 수요인원·우선순위 같은 내부 운영 수치도 마찬가지다.
--   그래서 관리자만 읽는 별도 테이블로 분리한다.

create table if not exists company_contacts (
  company_id uuid primary key references companies(id) on delete cascade,

  -- 담당자
  contact_name text,               -- 담당자 성명
  contact_title text,              -- 직함/부서
  contact_email text,              -- 수요조사에 적어준 업무 이메일(= 로그인 아이디)

  -- 수요조사 결과
  survey_fields text[] not null default '{}',  -- 희망분야 (예: SW/앱개발, AI/데이터/LLM)
  hiring_count int,                            -- 수요인원
  priority int,                                -- 우선순위
  contact_status text,                         -- 구분 (확정 등)
  source text,                                 -- 출처 배치 (예: 2026-IT-AI)

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table company_contacts enable row level security;

-- 관리자만 읽고 쓴다. 기업 본인에게도 열지 않는다(내부 운영 수치가 섞여 있음).
drop policy if exists "company_contacts admin only" on company_contacts;
create policy "company_contacts admin only" on company_contacts
  for all using (is_admin()) with check (is_admin());

comment on table company_contacts is
  '기업 담당자·수요조사 정보. companies 가 전체 공개라 PII·내부수치를 분리 보관한다. 관리자 전용.';
