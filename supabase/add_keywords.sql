-- 키워드 중간매칭 — 해시태그/키워드 컬럼 추가 (선택)
-- 실행 전에는 코드가 목업/유도값으로 동작하고, 실행하면 실제 저장됨.
-- Supabase SQL Editor 에 붙여넣기.

alter table companies
  add column if not exists hashtags text[] not null default '{}';

alter table student_profiles
  add column if not exists keywords text[] not null default '{}';

-- 겹침 검색 성능용 인덱스(선택)
create index if not exists idx_companies_hashtags on companies using gin (hashtags);
create index if not exists idx_student_keywords on student_profiles using gin (keywords);
