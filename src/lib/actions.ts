"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import { notify } from "./notify";
import type { Role, EmploymentType, AppStatus } from "./types";

import { cookies } from "next/headers";

/** 액션 결과 — 폼에서 에러/안내 메시지 표시용 */
export type ActionState = { error?: string; ok?: boolean; notice?: string };

/**
 * 목업 세션/프로필 쿠키 옵션.
 * maxAge 미지정(세션 쿠키) 시 브라우저 종료로 세션이 사라져 "다시 로그인" 증상이 발생하므로 30일 유지.
 * 서버에서만 읽으므로 httpOnly, 배포(HTTPS)에서는 secure.
 */
const MOCK_COOKIE = {
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

// ─────────────────────────────────────────────
// 인증
// ─────────────────────────────────────────────
export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const role = (String(formData.get("role") ?? "student") as Role);

  if (!email || !password) return { error: "이메일과 비밀번호를 입력해주세요." };
  if (password.length < 6) return { error: "비밀번호는 6자 이상이어야 합니다." };

  const supabase = await createClient();
  if (!supabase) {
    // Mock 회원가입
    const cookieStore = await cookies();
    const registeredVal = cookieStore.get("mock_registered_users")?.value;
    let registeredList: any[] = [];
    if (registeredVal) {
      try {
        registeredList = JSON.parse(registeredVal);
      } catch {}
    }
    
    // 이메일 중복 체크
    if (registeredList.some((u) => u.email === email)) {
      return { error: "이미 가입된 이메일입니다." };
    }

    const userId = "mock-uid-" + Math.random().toString(36).substring(2, 9);
    const mockUser = {
      id: userId,
      email,
      role,
      name,
      phone: "",
    };

    registeredList.push(mockUser);
    cookieStore.set("mock_registered_users", JSON.stringify(registeredList), MOCK_COOKIE);
    cookieStore.set("mock_user_session", JSON.stringify(mockUser), MOCK_COOKIE);

    redirect("/onboarding");
  }

  // 가입 — role/name은 user_metadata로 전달(handle_new_user 트리거가 profiles 생성)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role, name } },
  });
  if (error) return { error: error.message };

  // 이메일 인증(Confirm email)이 켜져 있으면 세션이 없다 → 온보딩으로 보내면 /login으로 튕긴다.
  // 이 경우 인증 메일 안내를 보여주고 멈춘다.
  if (!data.session) {
    return { notice: "가입이 접수되었습니다. 메일로 받은 인증 링크를 클릭한 뒤 로그인해주세요." };
  }

  redirect("/onboarding");
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "이메일과 비밀번호를 입력해주세요." };

  const supabase = await createClient();
  if (!supabase) {
    // Mock 로그인
    const cookieStore = await cookies();
    const registeredVal = cookieStore.get("mock_registered_users")?.value;
    let registeredList: any[] = [];
    if (registeredVal) {
      try {
        registeredList = JSON.parse(registeredVal);
      } catch {}
    }

    const user = registeredList.find((u) => u.email === email);
    if (!user) {
      return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
    }

    cookieStore.set("mock_user_session", JSON.stringify(user), MOCK_COOKIE);
    
    // 역할별 첫 화면 분기
    redirect(user.role === "company" ? "/biz" : user.role === "admin" ? "/admin" : "/companies");
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // 이메일 인증 미완료를 비밀번호 오류로 오인하지 않도록 구분 안내
    if (error.code === "email_not_confirmed" || /not confirmed/i.test(error.message)) {
      return { error: "이메일 인증이 완료되지 않았습니다. 가입 시 받은 인증 메일의 링크를 클릭한 뒤 다시 로그인해주세요." };
    }
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  // 역할별 첫 화면 분기 (프로필 행이 없으면 가입 시 저장한 메타데이터 role로 폴백)
  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  const role =
    (prof as { role: Role } | null)?.role ??
    ((data.user.user_metadata?.role as Role) ?? "student");
  redirect(role === "company" ? "/biz" : role === "admin" ? "/admin" : "/companies");
}

export async function signOut() {
  const supabase = await createClient();
  if (!supabase) {
    const cookieStore = await cookies();
    cookieStore.delete("mock_user_session");
    redirect("/");
  } else {
    await supabase.auth.signOut();
    redirect("/");
  }
}

// ─────────────────────────────────────────────
// 온보딩 — 프로필 저장
// ─────────────────────────────────────────────
export async function saveStudentProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const skills = formData.getAll("skills").map(String);
  const desiredJobs = formData.getAll("desiredJobs").map(String);

  const supabase = await createClient();
  if (!supabase) {
    const cookieStore = await cookies();
    const sessionVal = cookieStore.get("mock_user_session")?.value;
    if (!sessionVal) return { error: "로그인이 필요합니다." };
    const authUser = JSON.parse(sessionVal);

    const profile = {
      userId: authUser.id,
      name: authUser.name,
      dept: String(formData.get("dept") ?? ""),
      gradYear: Number(formData.get("gradYear")) || null,
      region: String(formData.get("region") ?? ""),
      skills,
      desiredJobs,
      intro: String(formData.get("intro") ?? ""),
      updatedAt: new Date().toISOString(),
    };

    cookieStore.set(`mock_student_profile_${authUser.id}`, JSON.stringify(profile), MOCK_COOKIE);
    redirect("/companies");
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

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
  if (!supabase) {
    const cookieStore = await cookies();
    const sessionVal = cookieStore.get("mock_user_session")?.value;
    if (!sessionVal) return { error: "로그인이 필요합니다." };
    const authUser = JSON.parse(sessionVal);

    const phone = String(formData.get("phone") ?? "");
    if (phone) {
      authUser.phone = phone;
      cookieStore.set("mock_user_session", JSON.stringify(authUser), MOCK_COOKIE);
      
      // Update registry
      const registeredVal = cookieStore.get("mock_registered_users")?.value;
      if (registeredVal) {
        try {
          const registeredList = JSON.parse(registeredVal);
          const idx = registeredList.findIndex((u: any) => u.id === authUser.id);
          if (idx !== -1) {
            registeredList[idx].phone = phone;
            cookieStore.set("mock_registered_users", JSON.stringify(registeredList), MOCK_COOKIE);
          }
        } catch {}
      }
    }

    const payload = {
      id: "mock-company-id-" + authUser.id,
      owner_id: authUser.id,
      name: String(formData.get("name") ?? ""),
      industry: String(formData.get("industry") ?? ""),
      region: String(formData.get("region") ?? ""),
      intro: String(formData.get("intro") ?? ""),
      perks: String(formData.get("perks") ?? ""),
    };

    cookieStore.set(`mock_company_profile_${authUser.id}`, JSON.stringify(payload), MOCK_COOKIE);
    redirect("/biz");
  }

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

  // 이력서 파일 업로드(Storage: resumes 버킷)
  let resumeUrl: string | null = null;
  const file = formData.get("resume");
  if (file instanceof File && file.size > 0) {
    const path = `${auth.user.id}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from("resumes").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (!upErr) {
      const { data: pub } = supabase.storage.from("resumes").getPublicUrl(path);
      resumeUrl = pub.publicUrl;
    }
  }

  const { error } = await supabase.from("applications").insert({
    job_id: jobId,
    student_id: auth.user.id,
    resume_url: resumeUrl,
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
