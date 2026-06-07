import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobById, getCompanyById, getJobApplicants } from "@/lib/data";
import StatusActions from "../StatusActions";

export default async function ApplicantsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = await getJobById(jobId);
  if (!job) notFound();
  const company = await getCompanyById(job.companyId);
  const applicants = await getJobApplicants(jobId);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="text-sm text-muted">{company?.name}</p>
      <h1 className="text-2xl font-bold mt-1 mb-1">{job.title} 지원자</h1>
      <p className="text-sm text-muted mb-8">적합도 점수순 · 총 {applicants.length}명</p>

      {applicants.length === 0 && (
        <p className="text-sm text-muted rounded-[18px] border border-line p-6">
          아직 지원자가 없습니다.
        </p>
      )}

      <div className="space-y-4">
        {applicants.map((a) => (
          <div key={a.applicationId} className="rounded-[18px] border border-line p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{a.student.name}</div>
                <div className="text-sm text-muted">{a.student.dept} · {a.student.region}</div>
              </div>
              <span className="badge badge-confirmed">적합도 {a.finalScore}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {a.student.skills.map((k) => (
                <span key={k} className="text-xs rounded-full bg-indigo-soft text-indigo px-2 py-0.5">{k}</span>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink/70">💡 {a.reason}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link href={`/biz/applicants/detail/${a.applicationId}`}
                className="rounded-full border border-line px-5 py-2 text-sm font-semibold hover:border-indigo transition-colors">
                서류 보기
              </Link>
              <StatusActions applicationId={a.applicationId} status={a.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
