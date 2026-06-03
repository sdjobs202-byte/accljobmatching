import Link from "next/link";
import { MOCK_JOBS, MOCK_STUDENT, companyById } from "@/lib/mock";
import { rankJobs } from "@/lib/matching";
import { STATUS_LABEL, type AppStatus } from "@/lib/types";

// 데모용 지원 현황 (실제: applications 테이블)
const MY_APPS: { jobId: string; status: AppStatus }[] = [
  { jobId: "j1", status: "interview_confirmed" },
  { jobId: "j3", status: "reviewing" },
];

const badgeClass: Record<AppStatus, string> = {
  submitted: "badge-submitted", reviewing: "badge-reviewing",
  interview_confirmed: "badge-confirmed", rejected: "badge-rejected", hired: "badge-confirmed",
};

export default function MyPage() {
  const recommended = rankJobs(MOCK_STUDENT, MOCK_JOBS).slice(0, 3);
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="hail text-3xl">{MOCK_STUDENT.name}님의 여정.</h1>
      <p className="text-sm text-muted mt-1 mb-10">{MOCK_STUDENT.dept} · {MOCK_STUDENT.region}</p>

      <h2 className="font-bold mb-3">지원 현황</h2>
      <div className="space-y-3 mb-12">
        {MY_APPS.map((a) => {
          const job = MOCK_JOBS.find((j) => j.id === a.jobId)!;
          const co = companyById(job.companyId);
          return (
            <div key={a.jobId} className="flex items-center justify-between rounded-xl border border-line p-4">
              <div>
                <div className="font-semibold">{job.title}</div>
                <div className="text-sm text-muted">{co?.name}</div>
              </div>
              <span className={`badge ${badgeClass[a.status]}`}>{STATUS_LABEL[a.status]}</span>
            </div>
          );
        })}
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
