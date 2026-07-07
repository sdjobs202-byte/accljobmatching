"use client";
import { useState } from "react";
import { useActionState } from "react";
import { submitApplication, type ActionState } from "@/lib/actions";

export default function ApplyForm({ jobId }: { jobId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(submitApplication, {});
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="jobId" value={jobId} />
      <div>
        <label className="text-sm font-semibold block mb-2">이력서 (PDF)</label>
        {/* 눈에 확 띄는 첨부 영역 — 카드 전체가 클릭됨 */}
        <label className="group flex items-center gap-3 rounded-2xl border-2 border-dashed border-indigo/40 bg-indigo-soft/40 px-4 py-4 cursor-pointer hover:border-indigo hover:bg-indigo-soft/70 transition-colors">
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-indigo text-white text-xl shrink-0">📎</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-ink">
              {fileName ? "다른 파일로 바꾸기" : "이력서 파일 첨부하기"}
            </span>
            <span className="block text-xs text-muted truncate">
              {fileName ? `✓ ${fileName}` : "PDF 파일을 눌러서 올려주세요"}
            </span>
          </span>
          <span className="rounded-full bg-indigo text-white px-5 py-2.5 text-sm font-semibold shrink-0 group-hover:bg-indigo/90 transition-colors">
            파일 선택
          </span>
          <input
            name="resume"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
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
