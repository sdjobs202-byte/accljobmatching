import { createClient } from "./supabase/server";
import {
  MOCK_COMPANIES,
  MOCK_JOBS,
  MOCK_STUDENT,
  companyById as mockCompanyById,
} from "./mock";
import type { Company, Job, StudentProfile, EmploymentType, AppStatus } from "./types";

/**
 * 데이터 접근 계층.
 * Supabase가 설정돼 있으면 실제 DB에서, 아니면 목업에서 읽는다.
 * DB 행(snake_case)을 앱 타입(camelCase)으로 매핑해
 * 기존 매칭 로직/페이지를 그대로 재사용한다.
 */

// ── 매퍼 ────────────────────────────────────────────
type JobRow = {
  id: string;
  company_id: string;
  title: string;
  job_category: string;
  employment_type: EmploymentType;
  region: string | null;
  required_skills: string[];
  description: string | null;
};
type CompanyRow = {
  id: string;
  name: string;
  industry: string | null;
  region: string | null;
  logo_url: string | null;
  intro: string | null;
  perks: string | null;
};

const mapJob = (r: JobRow): Job => ({
  id: r.id,
  companyId: r.company_id,
  title: r.title,
  jobCategory: r.job_category,
  employmentType: r.employment_type,
  region: r.region ?? "",
  requiredSkills: r.required_skills ?? [],
  description: r.description ?? "",
});

const mapCompany = (r: CompanyRow): Company => ({
  id: r.id,
  name: r.name,
  industry: r.industry ?? "",
  region: r.region ?? "",
  logoUrl: r.logo_url ?? undefined,
  intro: r.intro ?? "",
  perks: r.perks ?? "",
});

// ── 공고 ────────────────────────────────────────────
export async function getOpenJobs(): Promise<Job[]> {
  const supabase = await createClient();
  if (!supabase) return MOCK_JOBS;
  const { data, error } = await supabase
    .from("jobs")
    .select("id, company_id, title, job_category, employment_type, region, required_skills, description")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  if (error || !data) return MOCK_JOBS;
  return (data as JobRow[]).map(mapJob);
}

export async function getJobById(id: string): Promise<Job | null> {
  const supabase = await createClient();
  if (!supabase) return MOCK_JOBS.find((j) => j.id === id) ?? null;
  const { data } = await supabase
    .from("jobs")
    .select("id, company_id, title, job_category, employment_type, region, required_skills, description")
    .eq("id", id)
    .single();
  return data ? mapJob(data as JobRow) : null;
}

export async function getJobsByCompany(companyId: string): Promise<Job[]> {
  const supabase = await createClient();
  if (!supabase) return MOCK_JOBS.filter((j) => j.companyId === companyId);
  const { data } = await supabase
    .from("jobs")
    .select("id, company_id, title, job_category, employment_type, region, required_skills, description")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  return ((data as JobRow[]) ?? []).map(mapJob);
}

// ── 기업 ────────────────────────────────────────────
export async function getCompanies(): Promise<Company[]> {
  const supabase = await createClient();
  if (!supabase) return MOCK_COMPANIES;
  const { data } = await supabase
    .from("companies")
    .select("id, name, industry, region, logo_url, intro, perks");
  if (!data) return MOCK_COMPANIES;
  return (data as CompanyRow[]).map(mapCompany);
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const supabase = await createClient();
  if (!supabase) return mockCompanyById(id) ?? null;
  const { data } = await supabase
    .from("companies")
    .select("id, name, industry, region, logo_url, intro, perks")
    .eq("id", id)
    .single();
  return data ? mapCompany(data as CompanyRow) : null;
}

/** 현재 로그인 기업 사용자가 소유한 회사(없으면 null). */
export async function getMyCompany(): Promise<Company | null> {
  const supabase = await createClient();
  if (!supabase) return MOCK_COMPANIES[0];
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase
    .from("companies")
    .select("id, name, industry, region, logo_url, intro, perks")
    .eq("owner_id", auth.user.id)
    .maybeSingle();
  return data ? mapCompany(data as CompanyRow) : null;
}

// ── 학생 프로필 ──────────────────────────────────────
type StudentRow = {
  user_id: string;
  dept: string | null;
  region: string | null;
  skills: string[];
  desired_jobs: string[];
  intro: string | null;
};

/** 현재 로그인 학생의 프로필(매칭용). 미설정/미로그인 시 목업 학생. */
export async function getMyStudentProfile(): Promise<StudentProfile | null> {
  const supabase = await createClient();
  if (!supabase) return MOCK_STUDENT;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: prof } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", auth.user.id)
    .single();
  const { data } = await supabase
    .from("student_profiles")
    .select("user_id, dept, region, skills, desired_jobs, intro")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!data) return null;
  const r = data as StudentRow;
  return {
    userId: r.user_id,
    name: (prof as { name: string } | null)?.name ?? "",
    dept: r.dept ?? "",
    region: r.region ?? "",
    skills: r.skills ?? [],
    desiredJobs: r.desired_jobs ?? [],
    intro: r.intro ?? "",
  };
}

// ── 지원 현황 ────────────────────────────────────────
export interface MyApplication {
  id: string;
  jobId: string;
  status: AppStatus;
  jobTitle: string;
  companyName: string;
}

/** 현재 학생의 지원 목록. 미설정 시 목업. */
export async function getMyApplications(): Promise<MyApplication[]> {
  const supabase = await createClient();
  if (!supabase) {
    return [
      { id: "a1", jobId: "j1", status: "interview_confirmed", jobTitle: "CNC 가공 엔지니어", companyName: "한빛정밀" },
      { id: "a2", jobId: "j3", status: "reviewing", jobTitle: "배터리 품질 분석원", companyName: "그린에너지셀" },
    ];
  }
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data } = await supabase
    .from("applications")
    .select("id, job_id, status, jobs(title, companies(name))")
    .eq("student_id", auth.user.id)
    .order("created_at", { ascending: false });
  type Row = {
    id: string; job_id: string; status: AppStatus;
    jobs: { title: string; companies: { name: string } | null } | null;
  };
  return ((data as unknown as Row[]) ?? []).map((r) => ({
    id: r.id,
    jobId: r.job_id,
    status: r.status,
    jobTitle: r.jobs?.title ?? "",
    companyName: r.jobs?.companies?.name ?? "",
  }));
}
