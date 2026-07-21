import Link from "next/link";
import { MOCK_STUDENT } from "@/lib/mock";
import { rankJobs } from "@/lib/matching";
import { EMPLOYMENT_LABEL } from "@/lib/types";
import { getOpenJobs, getCompanies, getMyStudentProfile, getMyMatchKeywords } from "@/lib/data";
import { companyHashtags, scoreHashtagMatch } from "@/lib/keywords";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; region?: string }>;
}) {
  const sp = await searchParams;
  // 서로 독립적인 조회는 병렬로(왕복 지연 누적 방지).
  const [allJobs, companies, studentProfile, myKeywords] = await Promise.all([
    getOpenJobs(),
    getCompanies(),
    getMyStudentProfile(),
    getMyMatchKeywords(),
  ]);
  const companyById = (id: string) => companies.find((c) => c.id === id);

  let jobs = allJobs;
  if (sp.cat) jobs = jobs.filter((j) => j.jobCategory === sp.cat);
  if (sp.region) jobs = jobs.filter((j) => j.region === sp.region);
  if (sp.q) jobs = jobs.filter((j) => j.title.includes(sp.q!));

  // 로그인 학생 프로필 기준 적합도 정렬 (미로그인 시 데모 학생)
  const student = studentProfile ?? MOCK_STUDENT;
  const baseRanked = rankJobs(student, jobs);
  const categories = [...new Set(allJobs.map((j) => j.jobCategory))];

  // 중간매칭 키워드 부스팅: 저장한 키워드가 있으면 기업 해시태그 겹침으로 재정렬.
  const ranked = baseRanked
    .map((job) => {
      const co = companyById(job.companyId);
      const kw = myKeywords.length && co ? scoreHashtagMatch(myKeywords, companyHashtags(co)) : { score: 0, hits: [] };
      return { ...job, kw, blended: Math.round(job.match.finalScore * 0.6 + kw.score * 0.4) };
    })
    .sort((a, b) => (myKeywords.length ? b.blended - a.blended : b.match.finalScore - a.match.finalScore));

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="hail text-3xl mb-2">너에게 맞는 자리부터.</h1>
      <p className="text-muted text-sm mb-6">{student.name}님 프로필 기준 적합도순 정렬</p>

      {/* 중간매칭 키워드 배너 */}
      {myKeywords.length > 0 ? (
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl bg-indigo-soft/60 border border-indigo/15 px-5 py-4">
          <span className="text-sm font-semibold text-indigo">✨ {myKeywords.length}개 키워드로 매칭 중</span>
          <div className="flex flex-wrap gap-1.5">
            {myKeywords.slice(0, 6).map((k) => (
              <span key={k} className="text-xs rounded-full bg-white text-indigo px-2.5 py-0.5 font-medium">#{k}</span>
            ))}
            {myKeywords.length > 6 && <span className="text-xs text-muted self-center">+{myKeywords.length - 6}</span>}
          </div>
          <Link href="/match" className="ml-auto text-sm font-semibold text-indigo hover:underline">키워드 수정 →</Link>
        </div>
      ) : (
        <Link href="/match" className="mb-8 flex items-center gap-3 rounded-2xl bg-ink text-white px-5 py-4 hover:opacity-90 transition-opacity">
          <span className="text-sm font-semibold">✨ 원하는 서류를 넣으면 키워드로 딱 맞는 회사를 찾아드려요</span>
          <span className="ml-auto text-sm font-semibold">키워드 매칭 시작 →</span>
        </Link>
      )}

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
                <span className="badge badge-confirmed">적합도 {myKeywords.length ? job.blended : job.match.finalScore}</span>
              </div>
              <h2 className="mt-3 text-lg font-bold">{job.title}</h2>
              <p className="mt-1 text-sm text-muted">{co?.region} · {EMPLOYMENT_LABEL[job.employmentType]}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.requiredSkills.map((s) => (
                  <span key={s} className="text-xs rounded-full bg-indigo-soft text-indigo px-2 py-0.5">{s}</span>
                ))}
              </div>
              {job.kw.hits.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {job.kw.hits.slice(0, 4).map((h) => (
                    <span key={h} className="text-xs rounded-full bg-lime/50 text-ink px-2 py-0.5 font-medium">#{h}</span>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-ink/70 border-t border-line pt-3">💡 {job.match.reason}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
