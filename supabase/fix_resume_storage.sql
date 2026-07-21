-- ─────────────────────────────────────────────
-- 이력서 스토리지 보안 (resumes 버킷 = 비공개)
-- 배경: 버킷을 public→private 로 전환했고, 코드는 경로만 저장 후
--       기업/관리자에게만 service role 서명 URL을 발급한다(PII 보호).
-- 이 SQL: 학생이 "자기 폴더"에만 업로드/관리할 수 있도록 스토리지 RLS 추가.
--        기업의 읽기는 service role 서명 URL로 처리하므로 별도 read 정책 불필요.
-- 경로 규칙: `<auth.uid>/<timestamp>_<파일명>`  → 첫 폴더명 = 본인 uid
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 Run
-- ─────────────────────────────────────────────

-- 업로드: 인증 사용자가 자기 uid 폴더에만
drop policy if exists "resume upload own folder" on storage.objects;
create policy "resume upload own folder" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 본인 파일 조회/수정/삭제(선택: 학생 본인 화면에서 재업로드/확인용)
drop policy if exists "resume manage own folder" on storage.objects;
create policy "resume manage own folder" on storage.objects
for all to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);
