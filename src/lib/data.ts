import { createClient } from "./supabase/server";
import { MOCK_STUDENTS } from "./mock";
import { mockCompanies, mockJobs, readDeleted } from "./mockStore";
import type { Company, Job, StudentProfile, EmploymentType, AppStatus, Role } from "./types";
import { matchOne } from "./matching";
import { getSessionProfile } from "./auth";
import { createAdminClient, isSupabaseEnabled } from "./supabase/admin";
import { cookies } from "next/headers";

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
  hashtags?: string[] | null;
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
  hashtags: r.hashtags ?? undefined,
});

// ── 공고 ────────────────────────────────────────────
export async function getOpenJobs(): Promise<Job[]> {
  const supabase = await createClient();
  if (!supabase) return mockJobs();
  const { data, error } = await supabase
    .from("jobs")
    .select("id, company_id, title, job_category, employment_type, region, required_skills, description")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  if (error || !data) return mockJobs();
  return (data as JobRow[]).map(mapJob);
}

export async function getJobById(id: string): Promise<Job | null> {
  const supabase = await createClient();
  if (!supabase) return (await mockJobs()).find((j) => j.id === id) ?? null;
  const { data } = await supabase
    .from("jobs")
    .select("id, company_id, title, job_category, employment_type, region, required_skills, description")
    .eq("id", id)
    .single();
  return data ? mapJob(data as JobRow) : null;
}

export async function getJobsByCompany(companyId: string): Promise<Job[]> {
  const supabase = await createClient();
  if (!supabase) return (await mockJobs()).filter((j) => j.companyId === companyId);
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
  if (!supabase) return mockCompanies();
  const { data } = await supabase
    .from("companies")
    .select("id, name, industry, region, logo_url, intro, perks");
  if (!data) return mockCompanies();
  return (data as CompanyRow[]).map(mapCompany);
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const supabase = await createClient();
  if (!supabase) return (await mockCompanies()).find((c) => c.id === id) ?? null;
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
  if (!supabase) {
    const cookieStore = await cookies();
    const sessionVal = cookieStore.get("mock_user_session")?.value;
    if (!sessionVal) return null;
    try {
      const authUser = JSON.parse(sessionVal);
      const companyVal = cookieStore.get(`mock_company_profile_${authUser.id}`)?.value;
      if (companyVal) {
        return JSON.parse(companyVal);
      }
    } catch {}
    return null;
  }
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
  if (!supabase) {
    const cookieStore = await cookies();
    const sessionVal = cookieStore.get("mock_user_session")?.value;
    if (!sessionVal) return null;
    try {
      const authUser = JSON.parse(sessionVal);
      const profileVal = cookieStore.get(`mock_student_profile_${authUser.id}`)?.value;
      if (profileVal) {
        const parsed = JSON.parse(profileVal);
        return {
          userId: parsed.userId,
          name: parsed.name,
          dept: parsed.dept,
          region: parsed.region,
          skills: parsed.skills,
          desiredJobs: parsed.desiredJobs,
          intro: parsed.intro,
        };
      }
    } catch {}
    return null;
  }
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

/** 현재 사용자가 저장한 중간매칭 키워드. 없으면 빈 배열. */
export async function getMyMatchKeywords(): Promise<string[]> {
  const supabase = await createClient();
  if (!supabase) {
    const cookieStore = await cookies();
    const sessionVal = cookieStore.get("mock_user_session")?.value;
    if (!sessionVal) return [];
    try {
      const authUser = JSON.parse(sessionVal);
      const val = cookieStore.get(`mock_match_keywords_${authUser.id}`)?.value;
      return val ? (JSON.parse(val) as string[]) : [];
    } catch {
      return [];
    }
  }
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  // keywords 컬럼이 아직 없을 수 있으므로 실패해도 조용히 빈 배열.
  const { data, error } = await supabase
    .from("student_profiles")
    .select("keywords")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (error || !data) return [];
  return ((data as { keywords?: string[] | null }).keywords ?? []) as string[];
}

// ── 지원 현황 ────────────────────────────────────────
export interface MyApplication {
  id: string;
  jobId: string;
  companyId: string;
  status: AppStatus;
  jobTitle: string;
  companyName: string;
}

/** 현재 학생의 지원 목록. 미설정 시 목업. */
export async function getMyApplications(): Promise<MyApplication[]> {
  const supabase = await createClient();
  if (!supabase) {
    return [
      { id: "a1", jobId: "j1", companyId: "c1", status: "interview_confirmed", jobTitle: "CNC 가공 엔지니어", companyName: "한빛정밀" },
      { id: "a2", jobId: "j3", companyId: "c3", status: "reviewing", jobTitle: "배터리 품질 분석원", companyName: "그린에너지셀" },
    ];
  }
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data } = await supabase
    .from("applications")
    .select("id, job_id, status, jobs(title, company_id, companies(name))")
    .eq("student_id", auth.user.id)
    .order("created_at", { ascending: false });
  type Row = {
    id: string; job_id: string; status: AppStatus;
    jobs: { title: string; company_id: string; companies: { name: string } | null } | null;
  };
  return ((data as unknown as Row[]) ?? []).map((r) => ({
    id: r.id,
    jobId: r.job_id,
    companyId: r.jobs?.company_id ?? "",
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

  // 이력서: 비공개 버킷 경로 → 권한자(여기까지 RLS 통과한 기업/관리자)에게만 서명 URL 발급.
  // 레거시(과거 공개 URL "http…")는 그대로 사용.
  let resumeUrl: string | null = r.resume_url;
  if (resumeUrl && !resumeUrl.startsWith("http")) {
    const admin = createAdminClient();
    if (admin) {
      const { data: signed } = await admin.storage
        .from("resumes")
        .createSignedUrl(resumeUrl, 60 * 10); // 10분 유효
      resumeUrl = signed?.signedUrl ?? null;
    }
  }

  return {
    applicationId: r.id,
    status: r.status,
    student: toStudentProfile(r.student_id, r.student),
    job,
    coverLetter: r.cover_letter ?? "",
    resumeUrl,
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
  // 데모 모드: 목업 공고에서 내 회사 것만 보여준다(지원자 데이터는 없음).
  if (!supabase) {
    if (!company) return { company: null, jobs: [], totalApplicants: 0, confirmedCount: 0, recent: [] };
    const myJobs = (await mockJobs()).filter((j) => j.companyId === company.id);
    return {
      company,
      jobs: myJobs.map((j) => ({ ...j, applicantCount: 0 })),
      totalApplicants: 0,
      confirmedCount: 0,
      recent: [],
    };
  }
  if (!company) {
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

// Supabase 미설정(데모) 시 관리자 화면도 목업으로 채운다.
// 시드 + 관리자/기업이 추가한 항목(mockStore) − 삭제 표시(mock_admin_deleted).
const MOCK_JOIN_DATE = "2026-07-01";

/** 삭제 표시를 반영한 목업 학생/기업/공고(시드+추가 병합). */
async function mockAdminData(): Promise<{ students: StudentProfile[]; companies: Company[]; jobs: Job[] }> {
  const deleted = await readDeleted();
  const students = MOCK_STUDENTS.filter((s) => !deleted.has(`student:${s.userId}`));
  const [companies, jobs] = await Promise.all([mockCompanies(), mockJobs()]);
  return { students, companies, jobs };
}

/** 데모 매칭: 각 학생을 가장 잘 맞는 공고에 지원시킨 형태로 생성(결정론적). */
function buildMockMatches(students: StudentProfile[], jobs: Job[], companies: Company[]): AdminMatch[] {
  if (!jobs.length) return [];
  const nameById = new Map(companies.map((c) => [c.id, c.name] as const));
  const STATUS_CYCLE: AppStatus[] = ["interview_confirmed", "reviewing", "submitted", "hired", "rejected"];
  return students.map((s, i) => {
    let best = jobs[0];
    let bestScore = matchOne(s, jobs[0]).finalScore;
    for (const job of jobs) {
      const sc = matchOne(s, job).finalScore;
      if (sc > bestScore) {
        best = job;
        bestScore = sc;
      }
    }
    return {
      applicationId: `mock-app-${s.userId}`,
      studentName: s.name,
      jobTitle: best.title,
      companyName: nameById.get(best.companyId) ?? "",
      companyId: best.companyId,
      jobId: best.id,
      status: STATUS_CYCLE[i % STATUS_CYCLE.length],
      finalScore: bestScore,
    };
  });
}

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
  if (!isSupabaseEnabled()) {
    const { students, companies, jobs } = await mockAdminData();
    const matches = buildMockMatches(students, jobs, companies);
    const funnel = { ...empty.funnel };
    matches.forEach((m) => { funnel[m.status] += 1; });
    return { students: students.length, companies: companies.length, jobs: jobs.length, applications: matches.length, funnel };
  }
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
  if (!isSupabaseEnabled()) {
    const { students, companies } = await mockAdminData();
    return [
      ...students.map((s): AdminUser => ({ id: s.userId, name: s.name, role: "student", status: "active", createdAt: MOCK_JOIN_DATE })),
      ...companies.map((c): AdminUser => ({ id: c.id, name: c.name, role: "company", status: "active", createdAt: MOCK_JOIN_DATE })),
    ];
  }
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
  if (!isSupabaseEnabled()) {
    const { students, companies, jobs } = await mockAdminData();
    const matches = buildMockMatches(students, jobs, companies);
    const countByJob = new Map<string, number>();
    matches.forEach((m) => countByJob.set(m.jobId, (countByJob.get(m.jobId) ?? 0) + 1));
    const nameById = new Map(companies.map((c) => [c.id, c.name] as const));
    return jobs.map((j): AdminJob => ({
      id: j.id, title: j.title, companyName: nameById.get(j.companyId) ?? "",
      status: "open", applicantCount: countByJob.get(j.id) ?? 0, createdAt: MOCK_JOIN_DATE,
    }));
  }
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
  companyId: string; jobId: string;
  status: AppStatus; finalScore: number;
}

export async function getAdminMatches(): Promise<AdminMatch[]> {
  if (!isSupabaseEnabled()) {
    const { students, companies, jobs } = await mockAdminData();
    return buildMockMatches(students, jobs, companies);
  }
  const db = await adminDb();
  if (!db) return [];
  const jobs = await getOpenJobs();
  const jobMap = new Map(jobs.map((j) => [j.id, j]));
  const { data } = await db
    .from("applications")
    .select("id, status, job_id, student:profiles!student_id(name, student_profiles(dept, region, skills, desired_jobs, intro)), jobs(title, company_id, companies(name))")
    .order("created_at", { ascending: false });
  type Row = {
    id: string; status: AppStatus; job_id: string;
    student: EmbeddedStudent | null;
    jobs: { title: string; company_id: string; companies: { name: string } | null } | null;
  };
  return ((data as unknown as Row[]) ?? []).map((r) => {
    const job = jobMap.get(r.job_id);
    const score = job ? matchOne(toStudentProfile("", r.student), job).finalScore : 0;
    return {
      applicationId: r.id,
      studentName: r.student?.name ?? "",
      jobTitle: r.jobs?.title ?? "",
      companyName: r.jobs?.companies?.name ?? "",
      companyId: r.jobs?.company_id ?? "",
      jobId: r.job_id,
      status: r.status,
      finalScore: score,
    };
  });
}
