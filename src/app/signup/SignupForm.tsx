"use client";
import { useActionState } from "react";
import { signUp, type ActionState } from "@/lib/actions";

export default function SignupForm({ isCompany }: { isCompany: boolean }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(signUp, {});
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="role" value={isCompany ? "company" : "student"} />
      <input name="name" required placeholder={isCompany ? "회사명" : "이름"}
        className="w-full rounded-xl border border-line px-4 py-3" />
      <input name="email" type="email" required placeholder="이메일"
        className="w-full rounded-xl border border-line px-4 py-3" />
      <input name="password" type="password" required placeholder="비밀번호 (6자 이상)"
        className="w-full rounded-xl border border-line px-4 py-3" />
      <label className="flex items-start gap-2 text-xs text-muted">
        <input type="checkbox" required className="mt-0.5" /> 개인정보 수집·이용에 동의합니다. (필수)
      </label>
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      <button disabled={pending}
        className="w-full rounded-xl bg-indigo text-white py-3 font-semibold disabled:opacity-60">
        {pending ? "가입 중…" : "가입하고 프로필 작성"}
      </button>
    </form>
  );
}
