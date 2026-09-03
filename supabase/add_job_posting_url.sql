-- jobs 에 원문 채용공고 링크 컬럼 추가 (선택)
-- 실행: Supabase SQL Editor 또는 `supabase db query --linked -f supabase/add_job_posting_url.sql`
-- jobs 는 `create policy "jobs public read" ... using (status = 'open' or ...)` 로 열린 공고가
-- 공개되므로, 원문 링크처럼 공개해도 되는 정보만 여기 둔다.

alter table jobs
  add column if not exists posting_url text;
