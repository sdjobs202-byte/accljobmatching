import Link from "next/link";
import { notFound } from "next/navigation";
import { EMPLOYMENT_LABEL } from "@/lib/types";
import { getCompanyById, getJobsByCompany, getMyMatchKeywords } from "@/lib/data";
import { companyHashtags, scoreHashtagMatch } from "@/lib/keywords";
import { IconChevronRight } from "@/components/icons";

export default async function CompanyDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ job?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  // 모두 id(또는 세션)에만 의존 → 병렬 조회.
  const [company, jobs, myKeywords] = await Promise.all([
    getCompanyById(id),
    getJobsByCompany(id),
    getMyMatchKeywords(),
  ]);
  if (!company) notFound();

  const active = jobs.find((j) => j.id === sp.job) ?? jobs[0];

  // 기업소개 해시태그 + 내 중간매칭 키워드와의 겹침
  const tags = companyHashtags(company);
  const tagMatch = myKeywords.length ? scoreHashtagMatch(myKeywords, tags) : null;
  const hitSet = new Set((tagMatch?.hits ?? []).map((h) => h.toLowerCase()));

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      {/* 기업 헤더 */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-soft flex items-center justify-center text-indigo">
          <IconChevronRight size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-sm text-muted">{company.industry} · {company.region}</p>
        </div>
      </div>
      <p className="mt-4 text-ink/80">{company.intro}</p>
      <p className="mt-2 text-sm text-muted">우대/복지 · {company.perks}</p>
      {company.website && (
        <a href={company.website} target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-semibold text-indigo hover:underline">
          홈페이지 방문 ↗
        </a>
      )}

      {/* 기업소개 해시태그 */}
      {tags.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-muted">회사 키워드</span>
            {tagMatch && tagMatch.hits.length > 0 && (
              <span className="text-xs font-medium text-indigo">내 키워드와 겹쳐요</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => {
              const on = hitSet.has(t.toLowerCase());
              return (
                <span
                  key={t}
                  className={`text-xs rounded-full px-2.5 py-1 font-medium ${
                    on ? "bg-lime text-ink" : "bg-indigo-soft text-indigo"
                  }`}
                >
                  #{t}
                </span>
              );
            })}
          </div>
        </div>
      )}

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

      {active && (
        <div className="mt-6 rounded-[18px] border border-line p-7">
          <h2 className="text-xl font-bold">{active.title}</h2>
          <p className="mt-1 text-sm text-muted">
            {active.region} · {EMPLOYMENT_LABEL[active.employmentType]} · {active.jobCategory}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {active.requiredSkills.map((s) => (
              <span key={s} className="text-xs rounded-full bg-indigo-soft text-indigo px-2 py-0.5">{s}</span>
            ))}
          </div>
          <p className="mt-5 text-ink/80 whitespace-pre-line">{active.description}</p>
          {active.postingUrl && (
            <a href={active.postingUrl} target="_blank" rel="noopener noreferrer"
              className="mt-3 flex items-center gap-1 text-sm font-semibold text-indigo hover:underline">
              채용공고 원문 보기 ↗
            </a>
          )}
          <Link href={`/apply/${active.id}`}
            className="mt-6 inline-block rounded-full bg-indigo text-white px-7 py-3 font-semibold">
            이 공고에 지원하기
          </Link>
        </div>
      )}
    </div>
  );
}
