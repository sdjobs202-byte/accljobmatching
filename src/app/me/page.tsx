import Link from "next/link";
import { MOCK_STUDENT } from "@/lib/mock";
import { rankJobs } from "@/lib/matching";
import { STATUS_LABEL, type AppStatus } from "@/lib/types";
import { getMyApplications, getMyStudentProfile, getOpenJobs, getCompanies } from "@/lib/data";

const badgeClass: Record<AppStatus, string> = {
  submitted: "badge-submitted", reviewing: "badge-reviewing",
  interview_confirmed: "badge-confirmed", rejected: "badge-rejected", hired: "badge-confirmed",
};

export default async function MyPage() {
  const student = (await getMyStudentProfile()) ?? MOCK_STUDENT;
  const apps = await getMyApplications();
  const jobs = await getOpenJobs();
  const companies = await getCompanies();
  const companyById = (id: string) => companies.find((c) => c.id === id);
  const recommended = rankJobs(student, jobs).slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="hail text-3xl">{student.name}님의 여정.</h1>
      <p className="text-sm text-muted mt-1 mb-10">{student.dept} · {student.region}</p>

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
              <div className="text-sm text-muted">{a.companyName}</div>
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
