-- 대학생-기업 잡매칭 — Supabase 스키마 (MVP v1)
-- 실행: Supabase SQL Editor 에 붙여넣기 (또는 supabase db push)

-- ─────────────────────────────────────────────
-- 1. 프로필 (auth.users 1:1)
-- ─────────────────────────────────────────────
create type user_role as enum ('student', 'company', 'admin');
create type account_status as enum ('pending', 'active', 'suspended');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'student',
  name text not null default '',
  phone text,
  status account_status not null default 'active',
  created_at timestamptz not null default now()
);

create table student_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  dept text,                       -- 학과
  grad_year int,                   -- 졸업(예정) 연도
  region text,                     -- 희망 근무 지역
  skills text[] not null default '{}',         -- 역량 태그
  desired_jobs text[] not null default '{}',   -- 희망 직무 카테고리
  resume_url text,                 -- 이력서 파일 (Storage)
  portfolio_url text,
  intro text,                      -- 한 줄 소개
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 2. 기업 / 공고
-- ─────────────────────────────────────────────
create type job_status as enum ('draft', 'open', 'closed');
create type employment_type as enum ('fulltime', 'intern', 'contract', 'parttime');

create table companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete set null,
  name text not null,
  industry text,
  region text,
  logo_url text,
  intro text,
  perks text,                      -- 복지/우대사항
  status account_status not null default 'active',
  created_at timestamptz not null default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  title text not null,
  job_category text not null,                  -- 직무 카테고리
  employment_type employment_type not null default 'fulltime',
  region text,
  required_skills text[] not null default '{}',
  description text,
  status job_status not null default 'open',
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 3. 지원 / 매칭
-- ─────────────────────────────────────────────
create type application_status as enum
  ('submitted', 'reviewing', 'interview_confirmed', 'rejected', 'hired');

create table applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  resume_url text,
  cover_letter text,
  portfolio_url text,
  status application_status not null default 'submitted',
  interview_at timestamptz,
  created_at timestamptz not null default now(),
  unique (job_id, student_id)      -- 같은 공고 중복지원 방지
);

create table match_scores (
  job_id uuid not null references jobs(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  rule_score int not null default 0,           -- 규칙 점수 0~100
  ai_score int,                                -- AI 점수 0~100 (보조)
  final_score int not null default 0,
  reason text,                                 -- AI 한 줄 사유
  updated_at timestamptz not null default now(),
  primary key (job_id, student_id)
);

-- 운영자 조절 가중치 (singleton)
create table match_weights (
  id int primary key default 1,
  w_job int not null default 40,
  w_skills int not null default 30,
  w_region int not null default 15,
  w_employment int not null default 15,
  use_ai boolean not null default true,
  check (id = 1)
);
insert into match_weights (id) values (1);

-- ─────────────────────────────────────────────
-- 4. 알림
-- ─────────────────────────────────────────────
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  channel text not null default 'kakao',       -- kakao | sms
  template text not null,                       -- 예: interview_confirmed
  payload jsonb not null default '{}',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 5. RLS (행 수준 보안)
-- ─────────────────────────────────────────────
alter table profiles enable row level security;
alter table student_profiles enable row level security;
alter table companies enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table match_scores enable row level security;
alter table notifications enable row level security;

-- security definer + search_path 고정: 정책 안에서 profiles 재조회 시 RLS 재귀 방지(필수)
create or replace function is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- 프로필: 본인 조회/수정, 관리자 전체, 기업은 자기 공고 지원자 읽기
create policy "own profile read"  on profiles for select using (id = auth.uid() or is_admin());
create policy "own profile write" on profiles for update using (id = auth.uid());
create policy "insert own profile" on profiles for insert with check (id = auth.uid());
create policy "company reads applicant profiles" on profiles for select using (
  exists (
    select 1 from applications a
    join jobs j      on j.id = a.job_id
    join companies c on c.id = j.company_id
    where a.student_id = profiles.id and c.owner_id = auth.uid()
  )
);

-- 학생 프로필: 본인 + (공개) 기업/관리자 읽기
create policy "student self"  on student_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "student readable" on student_profiles for select using (true);

-- 공고: 누구나 open 조회, 소유 기업/관리자 수정
create policy "jobs public read" on jobs for select using (status = 'open' or is_admin()
  or exists (select 1 from companies c where c.id = company_id and c.owner_id = auth.uid()));
create policy "jobs owner write" on jobs for all
  using (exists (select 1 from companies c where c.id = company_id and c.owner_id = auth.uid()) or is_admin());

-- 기업: 공개 읽기, 소유자 수정
create policy "companies read" on companies for select using (true);
create policy "companies owner" on companies for all using (owner_id = auth.uid() or is_admin());

-- 지원서: 학생 본인 + 해당 기업 + 관리자
create policy "app student" on applications for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "app company read" on applications for select using (
  exists (select 1 from jobs j join companies c on c.id = j.company_id
          where j.id = job_id and c.owner_id = auth.uid()) or is_admin());
create policy "app company update" on applications for update using (
  exists (select 1 from jobs j join companies c on c.id = j.company_id
          where j.id = job_id and c.owner_id = auth.uid()) or is_admin());

-- 매칭점수: 본인/해당기업/관리자 읽기
create policy "match read" on match_scores for select using (
  student_id = auth.uid()
  or exists (select 1 from jobs j join companies c on c.id = j.company_id where j.id = job_id and c.owner_id = auth.uid())
  or is_admin());

create policy "notif own" on notifications for select using (user_id = auth.uid() or is_admin());

-- ─────────────────────────────────────────────
-- 6. 가입 시 프로필 자동 생성 트리거
-- ─────────────────────────────────────────────
-- search_path 고정 + 타입 스키마 명시: 없으면 가입 시 "Database error saving new user"
create or replace function handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, name)
  values (new.id, coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student'),
          coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();
