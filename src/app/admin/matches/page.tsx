import { MOCK_JOBS, MOCK_COMPANIES } from "@/lib/mock";
import { matchOne } from "@/lib/matching";
import { EMPLOYMENT_LABEL, type StudentProfile } from "@/lib/types";

const POOL: StudentProfile[] = [
  { userId: "s1", name: "김도윤",  dept: "스마트기계과",   region: "성남", skills: ["CNC","캐드","측정","품질"],         desiredJobs: ["기계설계","품질관리"],    intro: "정밀가공 전문" },
  { userId: "s2", name: "이서연",  dept: "전기과",         region: "판교", skills: ["PLC","전기제어"],                   desiredJobs: ["자동화"],                 intro: "제어 실습" },
  { userId: "s3", name: "박지훈",  dept: "스마트SW과",     region: "용인", skills: ["SQL","데이터분석","엑셀"],          desiredJobs: ["데이터","품질관리"],      intro: "데이터 분석 프로젝트" },
  { userId: "s4", name: "최수민",  dept: "메카트로닉스과", region: "성남", skills: ["PLC","CNC","설비"],                 desiredJobs: ["자동화","기계설계"],      intro: "메카트로닉스 실습 다수" },
  { userId: "s5", name: "정민준",  dept: "스마트기계과",   region: "성남", skills: ["CAM","캐드","측정"],               desiredJobs: ["기계설계"],               intro: "CAM 프로그래밍 특기" },
  { userId: "s6", name: "오하늘",  dept: "화학장치과",     region: "수원", skills: ["품질","데이터분석","엑셀","측정"],  desiredJobs: ["품질관리","데이터"],      intro: "공정 품질 분석 관심" },
];

export default function AdminMatchesPage() {
  const matchData = MOCK_JOBS.map((job) => {
    const co = MOCK_COMPANIES.find((c) => c.id === job.companyId)!;
    const ranked = POOL
      .map((s) => ({ s, m: matchOne(s, job) }))
      .sort((a, b) => b.m.finalScore - a.m.finalScore);
    const top3 = ranked.slice(0, 3);
    const highCount = ranked.filter((r) => r.m.finalScore >= 60).length;
    return { job, co, top3, highCount, total: POOL.length };
  });

  const totalHighMatches = matchData.reduce((s, d) => s + d.highCount, 0);
  const avgScore = Math.round(
    matchData.flatMap((d) => d.top3.map((t) => t.m.finalScore)).reduce((a, b) => a + b, 0) /
    matchData.flatMap((d) => d.top3).length
  );

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold">매칭 현황</h1>
          <p className="text-sm text-muted mt-0.5">
            적합도 60+ 매칭 {totalHighMatches}건 · 상위 3명 평균 {avgScore}점
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-lime" /> 80+
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-indigo-soft border border-indigo/20" /> 60–79
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-100" /> 60 미만
          </span>
        </div>
      </div>

      {/* 요약 KPI */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "공고 수", value: MOCK_JOBS.length },
          { label: "후보 학생", value: POOL.length },
          { label: "60+ 매칭 건수", value: totalHighMatches },
        ].map((k) => (
          <div key={k.label} className="rounded-[18px] border border-line p-5 bg-white">
            <div className="text-3xl font-extrabold text-indigo">{k.value}</div>
            <div className="text-sm text-muted mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* 공고별 매칭 */}
      <div className="space-y-5">
        {matchData.map(({ job, co, top3, highCount }) => (
          <div key={job.id} className="rounded-[18px] border border-line p-6 bg-white">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-bold text-base">{job.title}</h2>
                <p className="text-sm text-muted mt-0.5">
                  {co.name} · {job.region} · {EMPLOYMENT_LABEL[job.employmentType]} · {job.jobCategory}
                </p>
              </div>
              <div className="text-right">
                <span className="badge badge-submitted">{highCount}/{POOL.length}명 적합</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {top3.map(({ s, m }, rank) => {
                const scoreCls =
                  m.finalScore >= 80
                    ? "bg-lime text-ink"
                    : m.finalScore >= 60
                    ? "bg-indigo-soft text-indigo"
                    : "bg-gray-100 text-muted";
                return (
                  <div key={s.userId} className="rounded-xl border border-line p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted">#{rank + 1}</span>
                        <span className="font-semibold text-sm">{s.name}</span>
                      </div>
                      <span className={`badge ${scoreCls} text-xs font-bold`}>{m.finalScore}</span>
                    </div>
                    <p className="text-xs text-muted mb-2">{s.dept} · {s.region}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {s.skills.slice(0, 4).map((sk) => (
                        <span
                          key={sk}
                          className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                            job.requiredSkills.includes(sk)
                              ? "bg-lime/60 text-ink"
                              : "bg-gray-100 text-muted"
                          }`}
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-ink/60 leading-relaxed line-clamp-2">{m.reason}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
