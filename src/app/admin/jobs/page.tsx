import Link from "next/link";
import { MOCK_COMPANIES, MOCK_JOBS } from "@/lib/mock";
import { EMPLOYMENT_LABEL } from "@/lib/types";

type JobStatus = "open" | "pending" | "closed";

const JOB_STATUS_MAP: Record<string, JobStatus> = {
  j1: "open", j2: "open", j3: "open", j4: "pending",
};
const APPLICANT_COUNTS: Record<string, number> = {
  j1: 14, j2: 7, j3: 22, j4: 11,
};
const STATUS_LABEL: Record<JobStatus, string> = {
  open: "게시중", pending: "검토 대기", closed: "마감",
};
const STATUS_CLS: Record<JobStatus, string> = {
  open: "bg-lime text-ink",
  pending: "bg-amber-50 text-amber-700",
  closed: "bg-gray-100 text-muted",
};

export default function AdminJobsPage() {
  const open = MOCK_JOBS.filter((j) => JOB_STATUS_MAP[j.id] === "open").length;
  const pendingJobs = MOCK_JOBS.filter((j) => JOB_STATUS_MAP[j.id] === "pending");

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold">공고 관리</h1>
          <p className="text-sm text-muted mt-0.5">
            게시중 {open}개
            {pendingJobs.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5">
                검토 대기 {pendingJobs.length}건
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            placeholder="공고명·기업 검색"
            className="rounded-full border border-line px-4 py-2 text-sm focus:outline-none focus:border-indigo"
          />
          <select className="rounded-full border border-line px-4 py-2 text-sm focus:outline-none focus:border-indigo">
            <option value="">전체 상태</option>
            <option value="open">게시중</option>
            <option value="pending">검토 대기</option>
            <option value="closed">마감</option>
          </select>
        </div>
      </div>

      {/* 검토 대기 배너 */}
      {pendingJobs.length > 0 && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-amber-800">승인 대기 공고 {pendingJobs.length}건</span>
            <p className="text-xs text-amber-700 mt-0.5">
              {pendingJobs.map((j) => j.title).join(", ")}
            </p>
          </div>
          <button className="text-sm rounded-full bg-amber-700 text-white px-4 py-2 font-semibold">
            일괄 검토
          </button>
        </div>
      )}

      <div className="rounded-[18px] border border-line overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-muted text-xs border-b border-line">
            <tr>
              {["공고명", "기업", "직무", "고용형태", "지원자", "상태", "관리"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {MOCK_JOBS.map((job) => {
              const co = MOCK_COMPANIES.find((c) => c.id === job.companyId);
              const st = JOB_STATUS_MAP[job.id] ?? "open";
              return (
                <tr key={job.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4 font-semibold">{job.title}</td>
                  <td className="px-5 py-4 text-muted">{co?.name}</td>
                  <td className="px-5 py-4">{job.jobCategory}</td>
                  <td className="px-5 py-4 text-muted">{EMPLOYMENT_LABEL[job.employmentType]}</td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-indigo">{APPLICANT_COUNTS[job.id] ?? 0}</span>
                    <span className="text-muted">명</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${STATUS_CLS[st]}`}>{STATUS_LABEL[st]}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {st === "pending" && (
                        <button className="text-xs rounded-full bg-indigo text-white px-3 py-1.5 font-semibold">
                          승인
                        </button>
                      )}
                      <Link
                        href={`/biz/applicants/${job.id}`}
                        className="text-xs rounded-full border border-line px-3 py-1.5 text-muted hover:text-indigo hover:border-indigo transition-colors"
                      >
                        지원자
                      </Link>
                      {st === "open" && (
                        <button className="text-xs rounded-full border border-line px-3 py-1.5 text-muted hover:text-red-500 hover:border-red-300 transition-colors">
                          마감
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-5 py-3.5 border-t border-line bg-gray-50 text-xs text-muted">
          총 {MOCK_JOBS.length}개 공고
        </div>
      </div>
    </div>
  );
}
