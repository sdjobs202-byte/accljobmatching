"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AdminUser } from "@/lib/data";
import { adminUpdateUser, type ActionState } from "@/lib/actions";

const ROLE_LABEL: Record<string, string> = { student: "학생", company: "기업", admin: "관리자" };
const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "active", label: "활성" },
  { value: "pending", label: "승인 대기" },
  { value: "suspended", label: "정지" },
];

export default function AdminUserEditForm({ user }: { user: AdminUser }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(adminUpdateUser, {});

  return (
    <div className="mx-auto max-w-md px-8 py-12">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold">회원 수정</h1>
        <Link href="/admin/users" className="text-sm text-muted hover:text-indigo">← 회원 관리</Link>
      </div>
      <p className="text-sm text-muted mb-8">{ROLE_LABEL[user.role] ?? user.role} 회원 정보를 수정합니다.</p>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="userId" value={user.id} />

        <div>
          <label className="text-sm font-semibold block mb-1.5">역할</label>
          <p className="w-full rounded-xl border border-line bg-gray-50 px-4 py-3 text-sm text-muted">
            {ROLE_LABEL[user.role] ?? user.role} (변경 불가)
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1.5">이름 <span className="text-indigo">*</span></label>
          <input name="name" required defaultValue={user.name}
            className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo" />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1.5">상태</label>
          <select name="status" defaultValue={user.status}
            className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo">
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={pending}
            className="flex-1 rounded-xl bg-indigo text-white py-3.5 font-semibold text-base hover:bg-indigo/90 transition-colors disabled:opacity-60">
            {pending ? "저장 중…" : "수정 완료"}
          </button>
          <Link href="/admin/users"
            className="rounded-xl border border-line px-6 py-3.5 font-semibold text-sm text-muted hover:border-indigo hover:text-indigo transition-colors">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
