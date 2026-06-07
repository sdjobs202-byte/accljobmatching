import { createClient } from "./supabase/server";
import {
  MOCK_COMPANIES,
  MOCK_JOBS,
  MOCK_STUDENT,
  companyById as mockCompanyById,
} from "./mock";
import type { Company, Job, StudentProfile, EmploymentType, AppStatus, Role } from "./types";
import { matchOne } from "./matching";
import { getSessionProfile } from "./auth";
import { createAdminClient } from "./supabase/admin";

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

// ─────────────────────────────────────────────
// 기업(biz) 화면 데이터
// ─────────────────────────────────────────────
type EmbeddedStudent = {
  name: string;
  student_profiles: {
    dept: string | null; region: string | null;
    skills: string[]; desired_jobs: string[]; intro: string | null;
  } | null;
};

function toStudentProfile(userId: string, s: EmbeddedStudent | null): StudentProfile {
  const sp = s?.student_profiles;
  return {
    userId,
    name: s?.name ?? "",
    dept: sp?.dept ?? "",
    region: sp?.region ?? "",
    skills: sp?.skills ?? [],
    desiredJobs: sp?.desired_jobs ?? [],
    intro: sp?.intro ?? "",
  };
}

export interface Applicant {
  applicationId: string;
  status: AppStatus;
  student: StudentProfile;
  finalScore: number;
  reason: string;
  submittedAt: string;
}

/** 한 공고의 지원자 목록(적합도순). */
export async function getJobApplicants(jobId: string): Promise<Applicant[]> {
  const supabase = await createClient();
  const job = await getJobById(jobId);
  if (!supabase || !job) return [];

  const { data } = await supabase
    .from("applications")
    .select("id, status, created_at, student_id, student:profiles!student_id(name, student_profiles(dept, region, skills, desired_jobs, intro))")
    .eq("job_id", jobId);

  type Row = { id: string; status: AppStatus; created_at: string; student_id: string; student: EmbeddedStudent | null };
  const list = ((data as unknown as Row[]) ?? []).map((r) => {
    const student = toStudentProfile(r.student_id, r.student);
    const m = matchOne(student, job);
    return {
      applicationId: r.id,
      status: r.status,
      student,
      finalScore: m.finalScore,
      reason: m.reason ?? "",
      submittedAt: r.created_at?.slice(0, 10) ?? "",
    };
  });
  return list.sort((a, b) => b.finalScore - a.finalScore);
}

export interface ApplicationDetail {
  applicationId: string;
  status: AppStatus;
  student: StudentProfile;
  job: Job;
  coverLetter: string;
  resumeUrl: string | null;
  portfolioUrl: string | null;
  submittedAt: string;
}

/** 지원서 1건 상세. */
export async function getApplicationDetail(appId: string): Promise<ApplicationDetail | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("applications")
    .select("id, status, cover_letter, resume_url, portfolio_url, created_at, job_id, student_id, student:profiles!student_id(name, student_profiles(dept, region, skills, desired_jobs, intro))")
    .eq("id", appId)
    .single();
  if (!data) return null;
  type Row = {
    id: string; status: AppStatus; cover_letter: string | null; resume_url: string | null;
    portfolio_url: string | null; created_at: string; job_id: string; student_id: string;
    student: EmbeddedStudent | null;
  };
  const r = data as unknown as Row;
  const job = await getJobById(r.job_id);
  if (!job) return null;
  return {
    applicationId: r.id,
    status: r.status,
    student: toStudentProfile(r.student_id, r.student),
    job,
    coverLetter: r.cover_letter ?? "",
    resumeUrl: r.resume_url,
    portfolioUrl: r.portfolio_url,
    submittedAt: r.created_at?.slice(0, 10) ?? "",
  };
}

export interface BizDashboard {
  company: Company | null;
  jobs: Array<Job & { applicantCount: number }>;
  totalApplicants: number;
  confirmedCount: number;
  recent: Array<{ name: string; action: string; jobTitle: string; at: string }>;
}

/** 로그인 기업의 대시보드 데이터. */
export async function getBizDashboard(): Promise<BizDashboard> {
  const company = await getMyCompany();
  const supabase = await createClient();
  if (!supabase || !company) {
    return { company, jobs: [], totalApplicants: 0, confirmedCount: 0, recent: [] };
  }
  const jobs = await getJobsByCompany(company.id);
  const jobIds = jobs.map((j) => j.id);
  if (jobIds.length === 0) {
    return { company, jobs: [], totalApplicants: 0, confirmedCount: 0, recent: [] };
  }

  const { data: apps } = await supabase
    .from("applications")
    .select("id, status, created_at, job_id, student:profiles!student_id(name)")
    .in("job_id", jobIds)
    .order("created_at", { ascending: false });

  type Row = { id: string; status: AppStatus; created_at: string; job_id: string; student: { name: string } | null };
  const rows = (apps as unknown as Row[]) ?? [];
  const countByJob = new Map<string, number>();
  rows.forEach((r) => countByJob.set(r.job_id, (countByJob.get(r.job_id) ?? 0) + 1));

  const jobTitle = (id: string) => jobs.find((j) => j.id === id)?.title ?? "";
  const ACTION: Record<AppStatus, string> = {
    submitted: "지원 접수", reviewing: "서류 검토중",
    interview_confirmed: "면접 확정", rejected: "미선정", hired: "최종 합격",
  };

  return {
    company,
    jobs: jobs.map((j) => ({ ...j, applicantCount: countByJob.get(j.id) ?? 0 })),
    totalApplicants: rows.length,
    confirmedCount: rows.filter((r) => r.status === "interview_confirmed").length,
    recent: rows.slice(0, 6).map((r) => ({
      name: r.student?.name ?? "지원자",
      action: ACTION[r.status],
      jobTitle: jobTitle(r.job_id),
      at: r.created_at?.slice(0, 10) ?? "",
    })),
  };
}

// ─────────────────────────────────────────────
// 관리자(admin) 화면 데이터
// ─────────────────────────────────────────────
export interface AdminStats {
  students: number;
  companies: number;
  jobs: number;
  applications: number;
  funnel: Record<AppStatus, number>;
}

/**
 * 관리자 콘솔 전용 DB 클라이언트.
 * 현재 세션 사용자가 admin 역할일 때만 서비스 롤 클라이언트를 반환(RLS 우회),
 * 그 외에는 null → 데이터 비노출. Supabase 미설정 시에도 null.
 */
async function adminDb() {
  const profile = await getSessionProfile();
  if (profile?.role !== "admin") return null;
  return createAdminClient();
}

async function countTable(
  db: NonNullable<ReturnType<typeof createAdminClient>>,
  table: string,
  filter?: [string, string],
): Promise<number> {
  let q = db.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count } = await q;
  return count ?? 0;
}

export async function getAdminStats(): Promise<AdminStats> {
  const db = await adminDb();
  const empty: AdminStats = {
    students: 0, companies: 0, jobs: 0, applications: 0,
    funnel: { submitted: 0, reviewing: 0, interview_confirmed: 0, rejected: 0, hired: 0 },
  };
  if (!db) return empty;

  const [students, companies, jobs, applications] = await Promise.all([
    countTable(db, "profiles", ["role", "student"]),
    countTable(db, "companies"),
    countTable(db, "jobs"),
    countTable(db, "applications"),
  ]);

  const { data } = await db.from("applications").select("status");
  const funnel = { ...empty.funnel };
  ((data as { status: AppStatus }[]) ?? []).forEach((r) => { funnel[r.status] += 1; });

  return { students, companies, jobs, applications, funnel };
}

export interface AdminUser {
  id: string; name: string; role: Role; status: string; createdAt: string;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const db = await adminDb();
  if (!db) return [];
  const { data } = await db
    .from("profiles")
    .select("id, name, role, status, created_at")
    .order("created_at", { ascending: false });
  type Row = { id: string; name: string; role: Role; status: string; created_at: string };
  return ((data as Row[]) ?? []).map((r) => ({
    id: r.id, name: r.name, role: r.role, status: r.status, createdAt: r.created_at?.slice(0, 10) ?? "",
  }));
}

export interface AdminJob {
  id: string; title: string; companyName: string; status: string; applicantCount: number; createdAt: string;
}

export async function getAdminJobs(): Promise<AdminJob[]> {
  const db = await adminDb();
  if (!db) return [];
  const { data } = await db
    .from("jobs")
    .select("id, title, status, created_at, companies(name), applications(count)")
    .order("created_at", { ascending: false });
  type Row = {
    id: string; title: string; status: string; created_at: string;
    companies: { name: string } | null; applications: { count: number }[];
  };
  return ((data as unknown as Row[]) ?? []).map((r) => ({
    id: r.id, title: r.title, companyName: r.companies?.name ?? "",
    status: r.status, applicantCount: r.applications?.[0]?.count ?? 0,
    createdAt: r.created_at?.slice(0, 10) ?? "",
  }));
}

export interface AdminMatch {
  applicationId: string; studentName: string; jobTitle: string; companyName: string;
  status: AppStatus; finalScore: number;
}

export async function getAdminMatches(): Promise<AdminMatch[]> {
  const db = await adminDb();
  if (!db) return [];
  const jobs = await getOpenJobs();
  const jobMap = new Map(jobs.map((j) => [j.id, j]));
  const { data } = await db
    .from("applications")
    .select("id, status, job_id, student:profiles!student_id(name, student_profiles(dept, region, skills, desired_jobs, intro)), jobs(title, companies(name))")
    .order("created_at", { ascending: false });
  type Row = {
    id: string; status: AppStatus; job_id: string;
    student: EmbeddedStudent | null;
    jobs: { title: string; companies: { name: string } | null } | null;
  };
  return ((data as unknown as Row[]) ?? []).map((r) => {
    const job = jobMap.get(r.job_id);
    const score = job ? matchOne(toStudentProfile("", r.student), job).finalScore : 0;
    return {
      applicationId: r.id,
      studentName: r.student?.name ?? "",
      jobTitle: r.jobs?.title ?? "",
      companyName: r.jobs?.companies?.name ?? "",
      status: r.status,
      finalScore: score,
    };
  });
}
