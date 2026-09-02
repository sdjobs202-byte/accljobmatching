-- companies 에 홈페이지 주소 컬럼 추가 (선택)
-- 실행: Supabase SQL Editor 에 붙여넣기.
-- companies 는 `create policy "companies read" ... using (true)` 라 전 컬럼이 공개되므로
-- 홈페이지 주소처럼 공개해도 되는 정보만 여기 둔다(담당자 연락처 등은 company_contacts 로 분리).

alter table companies
  add column if not exists website text;
