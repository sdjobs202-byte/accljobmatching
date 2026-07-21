import Link from "next/link";
import { redirect } from "next/navigation";
import { MOCK_STUDENT } from "@/lib/mock";
import { rankJobs } from "@/lib/matching";
import { STATUS_LABEL, type AppStatus } from "@/lib/types";
import { getMyApplications, getMyStudentProfile, getOpenJobs, getCompanies } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { isSupabaseEnabled } from "@/lib/supabase/admin";

const badgeClass: Record<AppStatus, string> = {
  submitted: "badge-submitted", reviewing: "badge-reviewing",
  interview_confirmed: "badge-confirmed", rejected: "badge-rejected", hired: "badge-confirmed",
};

export default async function MyPage() {
  // 로그인 필수 (Supabase 연동 시). 미로그인 → 로그인 페이지
  if (isSupabaseEnabled() && !(await getSessionUser())) {
    redirect("/login");
  }
  const [studentProfile, apps, jobs, companies] = await Promise.all([
    getMyStudentProfile(),
    getMyApplications(),
    getOpenJobs(),
    getCompanies(),
  ]);
  const student = studentProfile ?? MOCK_STUDENT;
  const companyById = (id: string) => companies.find((c) => c.id === id);
  const recommended = rankJobs(student, jobs).slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-line">
        <div>
          <h1 className="hail text-3xl">{student.name}님의 여정.</h1>
          <p className="text-sm text-muted mt-1">{student.dept} · {student.region.split(",").join(", ")}</p>
        </div>
        <div>
          <Link href="/onboarding" className="inline-block rounded-full border border-indigo text-indigo px-5 py-2.5 text-sm font-semibold hover:bg-indigo hover:text-white transition-colors">
            프로필 수정
          </Link>
        </div>
      </div>

      <h2 className="font-bold mb-3">지원 현황</h2>
      <div className="space-y-3 mb-12">
        {apps.length === 0 && (
          <p className="text-sm text-muted rounded-xl border border-line p-4">
            아직 지원한 공고가 없어요. <Link href="/companies" className="text-indigo font-semibold">공고 보러가기</Link>
          </p>
        )}
        {apps.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-xl border border-line p-4">
            <div>
              <div className="font-semibold">{a.jobTitle}</div>
              <Link href={`/companies/${a.companyId}?job=${a.jobId}`} className="text-sm text-muted hover:text-indigo hover:underline">
                {a.companyName}
              </Link>
            </div>
            <span className={`badge ${badgeClass[a.status]}`}>{STATUS_LABEL[a.status]}</span>
          </div>
        ))}
      </div>

      <h2 className="font-bold mb-3">너에게 맞는 추천 공고</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {recommended.map((job) => (
          <Link key={job.id} href={`/companies/${job.companyId}?job=${job.id}`}
            className="rounded-xl border border-line p-5 hover:border-indigo">
            <span className="badge badge-confirmed">적합도 {job.match.finalScore}</span>
            <div className="mt-2 font-semibold">{job.title}</div>
            <div className="text-sm text-muted">{companyById(job.companyId)?.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
