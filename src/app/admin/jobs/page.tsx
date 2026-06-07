import Link from "next/link";
import { getAdminJobs } from "@/lib/data";

const STATUS_LABEL: Record<string, string> = {
  open: "게시중", draft: "임시저장", closed: "마감",
};
const STATUS_CLS: Record<string, string> = {
  open: "bg-lime text-ink",
  draft: "bg-amber-50 text-amber-700",
  closed: "bg-gray-100 text-muted",
};

export default async function AdminJobsPage() {
  const jobs = await getAdminJobs();
  const open = jobs.filter((j) => j.status === "open").length;

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold">공고 관리</h1>
          <p className="text-sm text-muted mt-0.5">전체 {jobs.length}개 · 게시중 {open}개</p>
        </div>
      </div>

      <div className="rounded-[18px] border border-line overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-muted text-xs border-b border-line">
            <tr>
              {["공고명", "기업", "지원자", "상태", "등록일", "관리"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {jobs.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">등록된 공고가 없습니다.</td></tr>
            )}
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-4 font-semibold">{job.title}</td>
                <td className="px-5 py-4 text-muted">{job.companyName}</td>
                <td className="px-5 py-4">
                  <span className="font-bold text-indigo">{job.applicantCount}</span>
                  <span className="text-muted">명</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`badge ${STATUS_CLS[job.status] ?? "bg-gray-100 text-muted"}`}>
                    {STATUS_LABEL[job.status] ?? job.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted">{job.createdAt}</td>
                <td className="px-5 py-4">
                  <Link
                    href={`/biz/applicants/${job.id}`}
                    className="text-xs rounded-full border border-line px-3 py-1.5 text-muted hover:text-indigo hover:border-indigo transition-colors"
                  >
                    지원자
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3.5 border-t border-line bg-gray-50 text-xs text-muted">
          총 {jobs.length}개 공고
        </div>
      </div>
    </div>
  );
}
