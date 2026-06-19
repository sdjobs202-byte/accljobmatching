-- ─────────────────────────────────────────────
-- RLS 무한재귀 + 기업 지원자 조회 정책 수정
-- 증상: 본인 외 profiles 행을 읽으면 "stack depth limit exceeded"(HTTP 500)
--       → 기업이 지원자 목록/상세에서 이름을 못 읽고 화면이 깨짐
-- 원인: is_admin()이 security definer가 아니라, profiles SELECT 정책 안에서
--       다시 profiles를 조회 → 정책 재평가 → 무한재귀
-- 해결: ① is_admin()을 security definer + search_path 고정으로 변경(RLS 우회)
--       ② 기업이 '자기 공고 지원자'의 프로필(이름)을 읽는 정책 추가
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- ─────────────────────────────────────────────

-- ① 재귀 제거: 함수가 RLS를 우회하도록 security definer 로 재정의
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ② 기업: 자기 공고에 지원한 학생의 프로필(이름 등) 읽기 허용
--    (없으면 재귀를 고쳐도 기업 화면에서 지원자 이름이 비어 보임)
drop policy if exists "company reads applicant profiles" on public.profiles;
create policy "company reads applicant profiles" on public.profiles
for select using (
  exists (
    select 1
    from public.applications a
    join public.jobs j      on j.id = a.job_id
    join public.companies c on c.id = j.company_id
    where a.student_id = profiles.id
      and c.owner_id = auth.uid()
  )
);
