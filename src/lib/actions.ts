"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import { notify } from "./notify";
import type { Role, EmploymentType, AppStatus } from "./types";

/** 액션 결과 — 폼에서 에러/안내 메시지 표시용 */
export type ActionState = { error?: string; notice?: string; ok?: boolean };

// ─────────────────────────────────────────────
// 인증
// ─────────────────────────────────────────────
export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  if (!supabase) return { error: "서버에 Supabase가 설정되지 않았습니다(.env.local 확인)." };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const role = (String(formData.get("role") ?? "student") as Role);

  if (!email || !password) return { error: "이메일과 비밀번호를 입력해주세요." };
  if (password.length < 6) return { error: "비밀번호는 6자 이상이어야 합니다." };

  // 가입 — role/name은 user_metadata로 전달(handle_new_user 트리거가 profiles 생성)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role, name } },
  });
  if (error) return { error: error.message };

  // 이메일 인증(Confirm email)이 켜져 있으면 세션이 발급되지 않는다.
  // 이 경우 자동 로그인이 불가하므로 온보딩으로 보내지 말고 안내를 띄운다.
  // (자동 로그인을 원하면 Supabase Auth 설정에서 "Confirm email"을 끈다.)
  if (!data.session) {
    return {
      ok: true,
      notice:
        "가입 확인 메일을 보냈어요. 메일의 링크를 클릭해 인증을 완료한 뒤 로그인해주세요.",
    };
  }

  redirect("/onboarding");
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  if (!supabase) return { error: "서버에 Supabase가 설정되지 않았습니다(.env.local 확인)." };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };

  // 역할별 첫 화면 분기
  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  const role = (prof as { role: Role } | null)?.role ?? "student";
  redirect(role === "company" ? "/biz" : role === "admin" ? "/admin" : "/companies");
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}

// ─────────────────────────────────────────────
// 온보딩 — 프로필 저장
// ─────────────────────────────────────────────
export async function saveStudentProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase 미설정." };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const skills = formData.getAll("skills").map(String);
  const desiredJobs = formData.getAll("desiredJobs").map(String);

  const { error } = await supabase.from("student_profiles").upsert({
    user_id: auth.user.id,
    dept: String(formData.get("dept") ?? ""),
    grad_year: Number(formData.get("gradYear")) || null,
    region: String(formData.get("region") ?? ""),
    skills,
    desired_jobs: desiredJobs,
    intro: String(formData.get("intro") ?? ""),
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: error.message };

  redirect("/companies");
}

export async function saveCompanyProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase 미설정." };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  // 연락처는 profiles.phone 에도 반영
  const phone = String(formData.get("phone") ?? "");
  if (phone) await supabase.from("profiles").update({ phone }).eq("id", auth.user.id);

  // 회사 1개(owner당) — 있으면 갱신, 없으면 생성
  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", auth.user.id)
    .maybeSingle();

  const payload = {
    owner_id: auth.user.id,
    name: String(formData.get("name") ?? ""),
    industry: String(formData.get("industry") ?? ""),
    region: String(formData.get("region") ?? ""),
    intro: String(formData.get("intro") ?? ""),
    perks: String(formData.get("perks") ?? ""),
  };

  const { error } = existing
    ? await supabase.from("companies").update(payload).eq("id", (existing as { id: string }).id)
    : await supabase.from("companies").insert(payload);
  if (error) return { error: error.message };

  redirect("/biz");
}

// ─────────────────────────────────────────────
// 공고 등록
// ─────────────────────────────────────────────
export async function createJob(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase 미설정." };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", auth.user.id)
    .maybeSingle();
  if (!company) return { error: "먼저 회사 정보를 등록해주세요(/onboarding)." };

  const { error } = await supabase.from("jobs").insert({
    company_id: (company as { id: string }).id,
    title: String(formData.get("title") ?? ""),
    job_category: String(formData.get("jobCategory") ?? ""),
    employment_type: (String(formData.get("employmentType") ?? "fulltime") as EmploymentType),
    region: String(formData.get("region") ?? ""),
    required_skills: formData.getAll("skills").map(String),
    description: String(formData.get("description") ?? ""),
    status: "open", // MVP: 등록 즉시 공개(승인 플로우는 관리자에서 토글)
  });
  if (error) return { error: error.message };

  revalidatePath("/biz");
  redirect("/biz");
}

// ─────────────────────────────────────────────
// 지원서 제출 (파일 업로드 포함)
// ─────────────────────────────────────────────
export async function submitApplication(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase 미설정." };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const jobId = String(formData.get("jobId") ?? "");
  if (!jobId) return { error: "공고 정보가 없습니다." };

  // 이력서 파일 업로드(Storage: resumes 비공개 버킷)
  // 공개 URL 대신 "경로"만 저장한다 → 조회 시 권한자에게 서명 URL을 발급(PII 보호)
  let resumePath: string | null = null;
  const file = formData.get("resume");
  if (file instanceof File && file.size > 0) {
    const path = `${auth.user.id}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from("resumes").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (!upErr) resumePath = path;
  }

  const { error } = await supabase.from("applications").insert({
    job_id: jobId,
    student_id: auth.user.id,
    resume_url: resumePath,
    cover_letter: String(formData.get("coverLetter") ?? ""),
    portfolio_url: String(formData.get("portfolioUrl") ?? "") || null,
    status: "submitted",
  });
  if (error) {
    if (error.code === "23505") return { error: "이미 지원한 공고입니다." };
    return { error: error.message };
  }

  // 기업 담당자에게 접수 알림
  const admin = createAdminClient();
  if (admin) {
    const { data: job } = await admin
      .from("jobs")
      .select("title, companies(owner_id)")
      .eq("id", jobId)
      .single();
    const ownerId = (job as { companies: { owner_id: string } | null } | null)?.companies?.owner_id;
    if (ownerId) {
      await notify({
        userId: ownerId,
        template: "application_received",
        payload: { jobId, jobTitle: (job as { title: string }).title },
      });
    }
  }

  redirect("/me");
}

// ─────────────────────────────────────────────
// 기업 — 지원서 상태 변경 (면접확정 / 미선정)
// ─────────────────────────────────────────────
export async function updateApplicationStatus(
  applicationId: string,
  status: AppStatus,
): Promise<ActionState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase 미설정." };

  const { data: app, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .select("student_id, job_id")
    .single();
  if (error) return { error: error.message };

  // 학생에게 결과 알림
  const row = app as { student_id: string; job_id: string };
  if (status === "interview_confirmed") {
    await notify({ userId: row.student_id, template: "interview_confirmed", payload: { jobId: row.job_id } });
  } else if (status === "rejected") {
    await notify({ userId: row.student_id, template: "application_rejected", payload: { jobId: row.job_id } });
  }

  revalidatePath("/biz");
  return { ok: true };
}
