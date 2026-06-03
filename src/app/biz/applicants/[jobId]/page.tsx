import { MOCK_JOBS, MOCK_STUDENT, companyById } from "@/lib/mock";
import { matchOne } from "@/lib/matching";
import { notFound } from "next/navigation";
import type { StudentProfile } from "@/lib/types";

// 데모 지원자 풀 (실제: applications join student_profiles)
const POOL: StudentProfile[] = [
  MOCK_STUDENT,
  { userId: "s2", name: "이서연", dept: "전기과", region: "판교", skills: ["PLC", "전기제어"], desiredJobs: ["자동화"], intro: "제어 실습 다수" },
  { userId: "s3", name: "박지훈", dept: "스마트SW과", region: "용인", skills: ["SQL", "데이터분석", "엑셀"], desiredJobs: ["데이터", "품질관리"], intro: "데이터 분석 프로젝트 경험" },
];

export default async function ApplicantsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = MOCK_JOBS.find((j) => j.id === jobId);
  if (!job) notFound();

  const ranked = POOL
    .map((s) => ({ s, m: matchOne(s, job) }))
    .sort((a, b) => b.m.finalScore - a.m.finalScore);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="text-sm text-muted">{companyById(job.companyId)?.name}</p>
      <h1 className="text-2xl font-bold mt-1 mb-1">{job.title} 지원자</h1>
      <p className="text-sm text-muted mb-8">적합도 점수순 · 총 {ranked.length}명</p>

      <div className="space-y-4">
        {ranked.map(({ s, m }) => (
          <div key={s.userId} className="rounded-[18px] border border-line p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{s.name}</div>
                <div className="text-sm text-muted">{s.dept} · {s.region}</div>
              </div>
              <span className="badge badge-confirmed">적합도 {m.finalScore}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.skills.map((k) => (
                <span key={k} className="text-xs rounded-full bg-indigo-soft text-indigo px-2 py-0.5">{k}</span>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink/70">💡 {m.reason}</p>
            <div className="mt-4 flex gap-2">
              <button className="rounded-full bg-indigo text-white px-5 py-2 text-sm font-semibold">면접 확정</button>
              <button className="rounded-full border border-line px-5 py-2 text-sm">서류 보기</button>
              <button className="rounded-full border border-line px-5 py-2 text-sm text-muted">미선정</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
