import { createClient as createSbClient } from "@supabase/supabase-js";

/**
 * 서비스 롤(관리자) 클라이언트 — 서버 전용.
 * RLS를 우회하므로 절대 클라이언트 컴포넌트/브라우저로 노출 금지.
 * 매칭 점수 캐시 upsert, 관리자 통계, 알림 발송 등 시스템 작업에만 사용.
 * 환경변수 미설정 시 null → 호출부에서 목업 폴백.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSbClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Supabase 연동이 켜져 있는지(환경변수 존재) 여부 */
export function isSupabaseEnabled() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * 서비스 롤 키가 설정돼 있는지 여부.
 * 이 키가 없으면 관리자 콘솔이 DB를 전혀 읽지 못한 채 "0건"으로만 보이므로,
 * 화면/액션에서 원인을 명시하기 위해 별도로 검사한다.
 */
export function isServiceRoleConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** 서비스 롤 키 누락 시 화면·액션에 공통으로 노출할 안내 문구. */
export const SERVICE_ROLE_MISSING_MSG =
  "서버 설정 누락: SUPABASE_SERVICE_ROLE_KEY 환경변수가 없습니다. Vercel 환경변수에 추가한 뒤 재배포해주세요.";
