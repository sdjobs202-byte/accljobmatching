import { MOCK_JOBS, companyById } from "@/lib/mock";
import { notFound } from "next/navigation";

export default async function ApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = MOCK_JOBS.find((j) => j.id === jobId);
  if (!job) notFound();
  const co = companyById(job.companyId);

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <p className="text-sm text-muted">{co?.name}</p>
      <h1 className="text-2xl font-bold mt-1 mb-8">{job.title} 지원하기</h1>
      <form className="space-y-5">
        <div>
          <label className="text-sm font-semibold">이력서 (PDF)</label>
          <input type="file" accept=".pdf" className="mt-2 block w-full text-sm" />
        </div>
        <div>
          <label className="text-sm font-semibold">자기소개서</label>
          <textarea rows={6} placeholder="지원 동기와 강점을 적어주세요"
            className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-semibold">포트폴리오 링크 (선택)</label>
          <input placeholder="https://" className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm" />
        </div>
        <button className="w-full rounded-xl bg-indigo text-white py-3 font-semibold">지원서 제출</button>
        <p className="text-xs text-muted">* 제출 시 기업에 접수 알림톡이 발송됩니다. (Supabase Storage 업로드 자리)</p>
      </form>
    </div>
  );
}
