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
