import { createClient } from "./supabase/server";
import type { Role } from "./types";

export interface SessionProfile {
  id: string;
  role: Role;
  name: string;
  phone: string | null;
  status: string;
}

/** 현재 로그인 사용자(없으면 null). Supabase 미설정 시 null. */
export async function getSessionUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/** 현재 사용자의 프로필 행(role 포함). 미로그인/미설정 시 null. */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, role, name, phone, status")
    .eq("id", auth.user.id)
    .single();
  return (data as SessionProfile) ?? null;
}
