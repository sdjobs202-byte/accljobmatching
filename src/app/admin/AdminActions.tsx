"use client";

import { useTransition } from "react";

type Result = { error?: string; ok?: boolean };

/** 확인 후 서버 액션(삭제)을 호출하는 버튼. bind된 서버 액션을 action으로 받는다. */
export function DeleteButton({
  action,
  confirmMsg,
  label = "삭제",
}: {
  action: () => Promise<Result>;
  confirmMsg: string;
  label?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmMsg)) return;
        start(async () => {
          const res = await action();
          if (res?.error) window.alert(res.error);
        });
      }}
      className="text-xs rounded-full border border-line px-3 py-1.5 text-muted hover:text-white hover:bg-rose-600 hover:border-rose-600 transition-colors disabled:opacity-50"
    >
      {pending ? "삭제중…" : label}
    </button>
  );
}

/** 데모 모드 더미데이터 복원 버튼. */
export function ResetButton({ action }: { action: () => Promise<Result> }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("삭제한 더미데이터를 모두 복원할까요?")) return;
        start(async () => {
          await action();
        });
      }}
      className="text-xs rounded-full border border-indigo text-indigo px-4 py-2 font-semibold hover:bg-indigo hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {pending ? "복원중…" : "↺ 더미데이터 복원"}
    </button>
  );
}
