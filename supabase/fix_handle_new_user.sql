-- 가입 자동 프로필 생성 트리거 수정
-- 문제: security definer 함수에 search_path 미지정 → user_role 타입 미해석 → 가입 시 "Database error"
-- 해결: search_path=public 설정 + 타입 스키마 명시(public.user_role)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student'),
    coalesce(new.raw_user_meta_data->>'name', '')
  );
  return new;
end; $$;

-- 트리거는 기존 것 재사용(함수 본문만 교체됨). 혹시 없으면 아래로 생성:
-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created
--   after insert on auth.users for each row execute function public.handle_new_user();
