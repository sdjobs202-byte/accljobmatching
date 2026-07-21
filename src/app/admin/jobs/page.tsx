import Link from "next/link";
import { getAdminJobs } from "@/lib/data";
import { deleteAdminJob, resetMockAdminData } from "@/lib/actions";
import { isSupabaseEnabled } from "@/lib/supabase/admin";
import { DeleteButton, ResetButton } from "../AdminActions";

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
  const demo = !isSupabaseEnabled();

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold">공고 관리</h1>
          <p className="text-sm text-muted mt-0.5">
            전체 {jobs.length}개 · 게시중 {open}개
            {demo && (
              <span className="ml-2 rounded-full bg-indigo-soft text-indigo text-xs font-semibold px-2 py-0.5">
                데모(더미) 데이터
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/jobs/new"
            className="text-xs rounded-full bg-indigo text-white px-4 py-2 font-semibold hover:bg-indigo/90 transition-colors whitespace-nowrap"
          >
            + 공고 등록
          </Link>
          {demo && <ResetButton action={resetMockAdminData} />}
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
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/biz/applicants/${job.id}`}
                      className="text-xs rounded-full border border-line px-3 py-1.5 text-muted hover:text-indigo hover:border-indigo transition-colors"
                    >
                      지원자
                    </Link>
                    <DeleteButton
                      action={deleteAdminJob.bind(null, job.id)}
                      confirmMsg={`공고 "${job.title}" 을(를) 삭제할까요?`}
                    />
                  </div>
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
