"use client";
import Link from "next/link";
import { useActionState } from "react";
import { signIn, type ActionState } from "@/lib/actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(signIn, {});

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="hail text-3xl mb-2">돌아온 걸 환영해.</h1>
      <p className="text-sm text-muted mb-8">잡매칭 로그인</p>
      <form action={formAction} className="space-y-3">
        <input name="email" type="email" required placeholder="이메일"
          className="w-full rounded-xl border border-line px-4 py-3" />
        <input name="password" type="password" required placeholder="비밀번호"
          className="w-full rounded-xl border border-line px-4 py-3" />
        {state.error && <p className="text-sm text-red-500">{state.error}</p>}
        {state.notice && <p className="text-sm text-emerald-600">{state.notice}</p>}
        <button disabled={pending}
          className="w-full rounded-xl bg-indigo text-white py-3 font-semibold disabled:opacity-60">
          {pending ? "로그인 중…" : "로그인"}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted text-center">
        처음이신가요? <Link href="/signup" className="text-indigo font-semibold">가입하기</Link>
      </p>
    </div>
  );
}
