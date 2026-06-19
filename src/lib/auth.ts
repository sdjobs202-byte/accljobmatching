import { createClient } from "./supabase/server";
import type { Role } from "./types";
import { cookies } from "next/headers";

export interface SessionProfile {
  id: string;
  role: Role;
  name: string;
  phone: string | null;
  status: string;
}

/** 현재 로그인 사용자(없으면 null). Supabase 미설정 시 mock_user_session 쿠키 조회. */
export async function getSessionUser() {
  const supabase = await createClient();
  if (!supabase) {
    const cookieStore = await cookies();
    const sessionVal = cookieStore.get("mock_user_session")?.value;
    if (!sessionVal) return null;
    try {
      const parsed = JSON.parse(sessionVal);
      return {
        id: parsed.id,
        email: parsed.email,
        user_metadata: { role: parsed.role, name: parsed.name },
      } as any;
    } catch {
      return null;
    }
  }
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/** 현재 사용자의 프로필 행(role 포함). 미로그인/미설정 시 mock_user_session 쿠키 조회. */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  if (!supabase) {
    const cookieStore = await cookies();
    const sessionVal = cookieStore.get("mock_user_session")?.value;
    if (!sessionVal) return null;
    try {
      const parsed = JSON.parse(sessionVal);
      return {
        id: parsed.id,
        role: parsed.role,
        name: parsed.name,
        phone: parsed.phone ?? null,
        status: "active",
      };
    } catch {
      return null;
    }
  }
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, role, name, phone, status")
    .eq("id", auth.user.id)
    .maybeSingle(); // single()은 0행이면 에러 → maybeSingle()로 null 허용
  if (data) return data as SessionProfile;

  // 프로필 행이 없는 경우(가입 트리거 누락/기존 계정 등) 로그인 세션은 유효하므로
  // 가입 시 저장한 user_metadata(role/name)로 폴백하고, 가능하면 행을 자가복구한다.
  // → 이렇게 하지 않으면 로그인에 성공해도 가드가 /login으로 되돌려 "다시 로그인" 루프가 발생.
  const meta = (auth.user.user_metadata ?? {}) as { role?: Role; name?: string };
  const role: Role = meta.role ?? "student";
  const name = meta.name ?? "";
  await supabase.from("profiles").upsert({ id: auth.user.id, role, name });
  return { id: auth.user.id, role, name, phone: null, status: "active" };
}

