"use client";
import { useState } from "react";
import { useActionState } from "react";
import { submitApplication, type ActionState } from "@/lib/actions";

/**
 * 첨부 가능한 최대 용량(MB).
 * 이력서는 서버 액션 본문으로 전송되므로 next.config 의 bodySizeLimit(10mb) 안에 들어와야 한다.
 * 자기소개서·멀티파트 오버헤드를 감안해 여유를 두고 8MB에서 미리 막는다.
 */
const MAX_FILE_MB = 8;

export default function ApplyForm({ jobId }: { jobId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(submitApplication, {});
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [portfolioFileName, setPortfolioFileName] = useState<string | null>(null);
  const [portfolioFileError, setPortfolioFileError] = useState<string | null>(null);

  // 용량 초과 파일을 그대로 제출하면 서버 액션이 본문 제한에 걸려 흰 화면으로 떨어진다.
  // 제출 전에 걸러서 무엇이 잘못됐는지 알려준다.
  function checkFile(
    e: React.ChangeEvent<HTMLInputElement>,
    setName: (v: string | null) => void,
    setError: (v: string | null) => void,
  ) {
    const file = e.target.files?.[0];
    if (!file) {
      setName(null);
      setError(null);
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      e.target.value = ""; // 선택 해제 — 초과 파일이 폼에 남지 않도록
      setName(null);
      setError(
        `파일이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB). ` +
          `${MAX_FILE_MB}MB 이하로 압축하거나 페이지 수를 줄여서 올려주세요.`,
      );
      return;
    }
    setError(null);
    setName(file.name);
  }

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
              {fileName ? `✓ ${fileName}` : `PDF 파일을 눌러서 올려주세요 (최대 ${MAX_FILE_MB}MB)`}
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
            onChange={(e) => checkFile(e, setFileName, setFileError)}
          />
        </label>
        {fileError && <p className="mt-2 text-sm text-red-500">{fileError}</p>}
      </div>
      <div>
        <label className="text-sm font-semibold">자기소개서</label>
        <textarea name="coverLetter" rows={6} required placeholder="지원 동기와 강점을 적어주세요"
          className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm" />
      </div>
      <div>
        <label className="text-sm font-semibold block mb-2">포트폴리오 (선택)</label>
        <label className="group flex items-center gap-3 rounded-2xl border-2 border-dashed border-indigo/40 bg-indigo-soft/40 px-4 py-4 cursor-pointer hover:border-indigo hover:bg-indigo-soft/70 transition-colors">
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-indigo text-white text-xl shrink-0">📎</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-ink">
              {portfolioFileName ? "다른 파일로 바꾸기" : "포트폴리오 파일 첨부하기"}
            </span>
            <span className="block text-xs text-muted truncate">
              {portfolioFileName ? `✓ ${portfolioFileName}` : `PDF 파일을 눌러서 올려주세요 (최대 ${MAX_FILE_MB}MB)`}
            </span>
          </span>
          <span className="rounded-full bg-indigo text-white px-5 py-2.5 text-sm font-semibold shrink-0 group-hover:bg-indigo/90 transition-colors">
            파일 선택
          </span>
          <input
            name="portfolio"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => checkFile(e, setPortfolioFileName, setPortfolioFileError)}
          />
        </label>
        {portfolioFileError && <p className="mt-2 text-sm text-red-500">{portfolioFileError}</p>}
        <p className="mt-2 text-xs text-muted">파일을 첨부하지 않으면 아래 링크가 대신 사용됩니다.</p>
        <input name="portfolioUrl" placeholder="https:// (파일 대신 링크로 제출하려면)"
          className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm" />
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
