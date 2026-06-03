import Link from "next/link";
import { MOCK_JOBS, MOCK_STUDENT, companyById } from "@/lib/mock";
import { rankJobs } from "@/lib/matching";
import { EMPLOYMENT_LABEL } from "@/lib/types";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; region?: string }>;
}) {
  const sp = await searchParams;
  let jobs = MOCK_JOBS;
  if (sp.cat) jobs = jobs.filter((j) => j.jobCategory === sp.cat);
  if (sp.region) jobs = jobs.filter((j) => j.region === sp.region);
  if (sp.q) jobs = jobs.filter((j) => j.title.includes(sp.q!));

  // 로그인 학생 기준 적합도 정렬 (데모: MOCK_STUDENT)
  const ranked = rankJobs(MOCK_STUDENT, jobs);
  const categories = [...new Set(MOCK_JOBS.map((j) => j.jobCategory))];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="hail text-3xl mb-2">너에게 맞는 자리부터.</h1>
      <p className="text-muted text-sm mb-8">{MOCK_STUDENT.name}님 프로필 기준 적합도순 정렬</p>

      {/* 필터 */}
      <form className="flex flex-wrap gap-2 mb-8">
        <input name="q" placeholder="공고 검색"
          className="rounded-full border border-line px-4 py-2 text-sm" />
        <select name="cat" className="rounded-full border border-line px-4 py-2 text-sm">
          <option value="">전체 직무</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="rounded-full bg-indigo text-white px-5 py-2 text-sm font-semibold">검색</button>
      </form>

      {/* 카드 그리드 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ranked.map((job) => {
          const co = companyById(job.companyId);
          return (
            <Link key={job.id} href={`/companies/${job.companyId}?job=${job.id}`}
              className="rounded-[18px] border border-line p-6 hover:border-indigo transition-colors flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted">{co?.name}</span>
                <span className="badge badge-confirmed">적합도 {job.match.finalScore}</span>
              </div>
              <h2 className="mt-3 text-lg font-bold">{job.title}</h2>
              <p className="mt-1 text-sm text-muted">{co?.region} · {EMPLOYMENT_LABEL[job.employmentType]}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.requiredSkills.map((s) => (
                  <span key={s} className="text-xs rounded-full bg-indigo-soft text-indigo px-2 py-0.5">{s}</span>
                ))}
              </div>
              <p className="mt-4 text-xs text-ink/70 border-t border-line pt-3">💡 {job.match.reason}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
