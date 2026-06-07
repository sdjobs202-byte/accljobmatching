"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateApplicationStatus } from "@/lib/actions";
import { STATUS_LABEL, type AppStatus } from "@/lib/types";

export default function StatusActions({
  applicationId,
  status,
  size = "sm",
}: {
  applicationId: string;
  status: AppStatus;
  size?: "sm" | "lg";
}) {
  const [current, setCurrent] = useState<AppStatus>(status);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string>();
  const router = useRouter();

  const change = (next: AppStatus) =>
    startTransition(async () => {
      const res = await updateApplicationStatus(applicationId, next);
      if (res.error) { setErr(res.error); return; }
      setCurrent(next);
      router.refresh();
    });

  if (current === "interview_confirmed" || current === "rejected" || current === "hired") {
    return (
      <span className={`badge ${current === "rejected" ? "badge-rejected" : "badge-confirmed"}`}>
        {STATUS_LABEL[current]} 처리됨
      </span>
    );
  }

  const big = size === "lg";
  const confirmCls = big
    ? "flex-1 rounded-xl py-3.5 bg-indigo text-white text-sm font-semibold hover:bg-indigo/90 transition-colors disabled:opacity-60"
    : "rounded-full px-5 py-2 bg-indigo text-white text-sm font-semibold hover:bg-indigo/90 transition-colors disabled:opacity-60";
  const reviewCls = big
    ? "rounded-xl px-6 py-3.5 border border-line text-sm font-semibold hover:border-indigo hover:text-indigo transition-colors disabled:opacity-60"
    : "rounded-full px-5 py-2 border border-line text-sm font-semibold hover:border-indigo hover:text-indigo transition-colors disabled:opacity-60";
  const rejectCls = big
    ? "flex-1 rounded-xl py-3.5 border border-line text-sm font-semibold text-muted hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-60"
    : "rounded-full px-5 py-2 border border-line text-sm font-semibold text-muted hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-60";

  return (
    <div className={big ? "flex gap-3 w-full" : "flex flex-wrap gap-2 items-center"}>
      <button disabled={pending} onClick={() => change("interview_confirmed")} className={confirmCls}>
        면접 확정{big ? " 통보" : ""}
      </button>
      {current === "submitted" && (
        <button disabled={pending} onClick={() => change("reviewing")} className={reviewCls}>
          검토중
        </button>
      )}
      <button disabled={pending} onClick={() => change("rejected")} className={rejectCls}>
        미선정{big ? " 처리" : ""}
      </button>
      {err && <span className="text-xs text-red-500 self-center">{err}</span>}
    </div>
  );
}
