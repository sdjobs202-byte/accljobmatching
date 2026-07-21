import { cookies } from "next/headers";
import { MOCK_COMPANIES, MOCK_JOBS } from "./mock";
import type { Company, Job } from "./types";

/**
 * 데모(Supabase 미설정) 모드의 관리자/기업 CRUD 저장소.
 * 서버가 없으므로 쿠키에 상태를 얹는다:
 *   mock_admin_companies : 관리자/기업이 추가한 회사 목록(Company[])
 *   mock_admin_jobs      : 추가한 공고 목록(Job[])
 *   mock_admin_deleted   : 삭제 표시 키(Set) — student:<id> / company:<id> / job:<id>
 * 읽기는 서버 컴포넌트 렌더에서, 쓰기는 서버 액션에서만 호출한다(쿠키 쓰기 제약).
 * 주의: 쿠키 용량(≈4KB) 한계 → 데모 규모(수 개)만 상정.
 */
const C_COOKIE = "mock_admin_companies";
const J_COOKIE = "mock_admin_jobs";
const DEL_COOKIE = "mock_admin_deleted";

const OPTS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

async function readArr<T>(name: string): Promise<T[]> {
  const v = (await cookies()).get(name)?.value;
  if (!v) return [];
  try {
    return JSON.parse(v) as T[];
  } catch {
    return [];
  }
}
async function writeArr(name: string, arr: unknown[]) {
  (await cookies()).set(name, JSON.stringify(arr), OPTS);
}

/** 간단 랜덤 id. */
export function rid(prefix: string) {
  return prefix + Math.random().toString(36).slice(2, 9);
}

// ── 삭제 표시 ────────────────────────────────────────
export async function readDeleted(): Promise<Set<string>> {
  return new Set(await readArr<string>(DEL_COOKIE));
}
export async function addDeleted(key: string) {
  const list = await readArr<string>(DEL_COOKIE);
  if (!list.includes(key)) list.push(key);
  await writeArr(DEL_COOKIE, list);
}

// ── 추가 회사/공고 ───────────────────────────────────
export const readAddedCompanies = () => readArr<Company>(C_COOKIE);
export const readAddedJobs = () => readArr<Job>(J_COOKIE);

export async function addCompany(c: Company) {
  const list = await readAddedCompanies();
  list.push(c);
  await writeArr(C_COOKIE, list);
}
/** 회사가 없으면 추가(있으면 무시). 기업 로그인 회사를 전역 목록에 노출시킬 때 사용. */
export async function upsertCompany(c: Company) {
  if (MOCK_COMPANIES.some((m) => m.id === c.id)) return;
  const list = await readAddedCompanies();
  if (list.some((x) => x.id === c.id)) return;
  list.push(c);
  await writeArr(C_COOKIE, list);
}
export async function addJob(j: Job) {
  const list = await readAddedJobs();
  list.push(j);
  await writeArr(J_COOKIE, list);
}

// ── 병합 뷰(시드 + 추가 − 삭제) ──────────────────────
/** 표시용 전체 회사 목록. */
export async function mockCompanies(): Promise<Company[]> {
  const del = await readDeleted();
  return [...MOCK_COMPANIES, ...(await readAddedCompanies())].filter(
    (c) => !del.has(`company:${c.id}`),
  );
}
/** 표시용 전체 공고 목록(삭제된 회사의 공고도 제외). */
export async function mockJobs(): Promise<Job[]> {
  const del = await readDeleted();
  return [...MOCK_JOBS, ...(await readAddedJobs())].filter(
    (j) => !del.has(`job:${j.id}`) && !del.has(`company:${j.companyId}`),
  );
}

// ── 초기화(복원) ─────────────────────────────────────
export async function clearMockStore() {
  const c = await cookies();
  c.delete(DEL_COOKIE);
  c.delete(C_COOKIE);
  c.delete(J_COOKIE);
}
