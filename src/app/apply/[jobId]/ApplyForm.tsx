"use client";
import { useActionState } from "react";
import { submitApplication, type ActionState } from "@/lib/actions";

export default function ApplyForm({ jobId }: { jobId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(submitApplication, {});
  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="jobId" value={jobId} />
      <div>
        <label className="text-sm font-semibold">이력서 (PDF)</label>
        <input name="resume" type="file" accept=".pdf" className="mt-2 block w-full text-sm" />
      </div>
      <div>
        <label className="text-sm font-semibold">자기소개서</label>
        <textarea name="coverLetter" rows={6} required placeholder="지원 동기와 강점을 적어주세요"
          className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm" />
      </div>
      <div>
        <label className="text-sm font-semibold">포트폴리오 링크 (선택)</label>
        <input name="portfolioUrl" placeholder="https://" className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm" />
      </div>
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      <button disabled={pending}
        className="w-full rounded-xl bg-indigo text-white py-3 font-semibold disabled:opacity-60">
        {pending ? "제출 중…" : "지원서 제출"}
      </button>
      <p className="text-xs text-muted">* 제출 시 기업에 접수 알림톡이 발송됩니다.</p>
    </form>
  );
}
