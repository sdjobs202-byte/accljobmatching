import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_STUDENT } from "@/lib/mock";
import { matchOne } from "@/lib/matching";
import { EMPLOYMENT_LABEL } from "@/lib/types";
import { getCompanyById, getJobsByCompany, getMyStudentProfile } from "@/lib/data";

export default async function CompanyDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ job?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const company = await getCompanyById(id);
  if (!company) notFound();

  const jobs = await getJobsByCompany(id);
  const active = jobs.find((j) => j.id === sp.job) ?? jobs[0];
  const student = (await getMyStudentProfile()) ?? MOCK_STUDENT;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      {/* 기업 헤더 */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-soft flex items-center justify-center text-indigo font-extrabold text-xl">
          {company.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-sm text-muted">{company.industry} · {company.region}</p>
        </div>
      </div>
      <p className="mt-4 text-ink/80">{company.intro}</p>
      <p className="mt-2 text-sm text-muted">우대/복지 · {company.perks}</p>

      {/* 공고 탭 */}
      <div className="mt-10 flex gap-2">
        {jobs.map((j) => (
          <Link key={j.id} href={`/companies/${id}?job=${j.id}`}
            className={`rounded-full px-4 py-2 text-sm font-medium border ${
              j.id === active?.id ? "bg-indigo text-white border-indigo" : "border-line"
            }`}>
            {j.title}
          </Link>
        ))}
      </div>

      {active && (() => {
        const m = matchOne(student, active);
        return (
          <div className="mt-6 rounded-[18px] border border-line p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{active.title}</h2>
              <span className="badge badge-confirmed">적합도 {m.finalScore}</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {active.region} · {EMPLOYMENT_LABEL[active.employmentType]} · {active.jobCategory}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {active.requiredSkills.map((s) => (
                <span key={s} className="text-xs rounded-full bg-indigo-soft text-indigo px-2 py-0.5">{s}</span>
              ))}
            </div>
            <p className="mt-5 text-ink/80">{active.description}</p>
            <div className="mt-4 rounded-xl bg-indigo-soft/50 p-4 text-sm">
              <b className="text-indigo">AI 매칭 코멘트</b> · {m.reason}
            </div>
            <Link href={`/apply/${active.id}`}
              className="mt-6 inline-block rounded-full bg-indigo text-white px-7 py-3 font-semibold">
              이 공고에 지원하기
            </Link>
          </div>
        );
      })()}
    </div>
  );
}
