import Link from "next/link";
import { MOCK_COMPANIES, MOCK_JOBS } from "@/lib/mock";
import { EMPLOYMENT_LABEL } from "@/lib/types";

const MY_COMPANY = MOCK_COMPANIES[0];
const MY_JOBS = MOCK_JOBS.filter((j) => j.companyId === MY_COMPANY.id);

const APPLICANT_COUNTS: Record<string, number> = { j1: 14, j2: 7, j3: 22, j4: 11 };

const RECENT_ACTIVITY = [
  { name: "김도윤", action: "지원 접수", jobTitle: "CNC 가공 엔지니어", at: "10분 전" },
  { name: "이서연", action: "서류 검토 완료", jobTitle: "CNC 가공 엔지니어", at: "2시간 전" },
  { name: "박지훈", action: "면접 확정", jobTitle: "배터리 품질 분석원", at: "어제" },
  { name: "최수민", action: "지원 접수", jobTitle: "CNC 가공 엔지니어", at: "어제" },
];

export default function BizDashboard() {
  const totalApplicants = MY_JOBS.reduce((s, j) => s + (APPLICANT_COUNTS[j.id] ?? 0), 0);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      {/* 기업 헤더 */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-2xl bg-indigo-soft flex items-center justify-center text-indigo font-extrabold text-2xl">
          {MY_COMPANY.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{MY_COMPANY.name}</h1>
          <p className="text-sm text-muted">{MY_COMPANY.industry} · {MY_COMPANY.region}</p>
        </div>
        <Link
          href="/biz/jobs/new"
          className="ml-auto rounded-full bg-indigo text-white px-5 py-2.5 text-sm font-semibold hover:bg-indigo/90 transition-colors"
        >
          + 공고 등록
        </Link>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {[
          { label: "등록 공고", value: MY_JOBS.length },
          { label: "총 지원자", value: totalApplicants },
          { label: "면접 확정", value: 3 },
        ].map((k) => (
          <div key={k.label} className="rounded-[18px] border border-line p-6">
            <div className="text-3xl font-extrabold text-indigo">{k.value}</div>
            <div className="text-sm text-muted mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 공고 목록 */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-bold mb-4">내 공고</h2>
          {MY_JOBS.map((job) => (
            <div key={job.id} className="rounded-[18px] border border-line p-5 flex items-center justify-between">
              <div>
                <div className="font-semibold">{job.title}</div>
                <div className="text-sm text-muted mt-0.5">
                  {job.region} · {EMPLOYMENT_LABEL[job.employmentType]}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-indigo">
                  {APPLICANT_COUNTS[job.id] ?? 0}명
                </span>
                <Link
                  href={`/biz/applicants/${job.id}`}
                  className="rounded-full border border-indigo text-indigo px-4 py-1.5 text-sm font-semibold hover:bg-indigo hover:text-white transition-colors"
                >
                  지원자 보기
                </Link>
              </div>
            </div>
          ))}
          <Link
            href="/biz/jobs/new"
            className="flex items-center justify-center rounded-[18px] border border-dashed border-line p-5 text-sm text-muted hover:border-indigo hover:text-indigo transition-colors"
          >
            + 새 공고 등록
          </Link>
        </div>

        {/* 최근 활동 */}
        <div>
          <h2 className="font-bold mb-4">최근 활동</h2>
          <div className="space-y-2">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="rounded-xl border border-line p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{a.name}</span>
                  <span className="text-xs text-muted">{a.at}</span>
                </div>
                <div className="text-xs text-muted">{a.action}</div>
                <div className="text-xs text-ink/60 mt-0.5">{a.jobTitle}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
