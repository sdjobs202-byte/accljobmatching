"use client";

import Link from "next/link";
import { useActionState } from "react";
import { adminCreateCompany, type ActionState } from "@/lib/actions";
import { KEYWORD_BANK } from "@/lib/keywords";

const REGIONS = ["성남", "판교", "용인", "수원", "서울", "기타"];

export default function AdminNewCompanyPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(adminCreateCompany, {});

  return (
    <div className="mx-auto max-w-2xl px-8 py-12">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold">기업 회원 등록</h1>
        <Link href="/admin/users" className="text-sm text-muted hover:text-indigo">← 회원 관리</Link>
      </div>
      <p className="text-sm text-muted mb-8">
        관리자가 기업 회원을 직접 추가합니다. 이메일·비밀번호를 입력하면 로그인 가능한 기업 계정으로 생성됩니다(실 DB 모드).
      </p>

      <form action={formAction} className="space-y-6">
        <div>
          <label className="text-sm font-semibold block mb-1.5">회사명 <span className="text-indigo">*</span></label>
          <input name="name" required placeholder="예) 한빛정밀"
            className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1.5">업종</label>
            <select name="industry" defaultValue="" className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo">
              <option value="">선택</option>
              {KEYWORD_BANK.industry.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5">지역</label>
            <select name="region" className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo">
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1.5">로그인 이메일 <span className="text-muted font-normal">(실 DB)</span></label>
            <input name="email" type="email" placeholder="company@example.com"
              className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo" />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5">임시 비밀번호 <span className="text-muted font-normal">(실 DB)</span></label>
            <input name="password" type="text" placeholder="6자 이상"
              className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo" />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1.5">회사 소개</label>
          <input name="intro" placeholder="예) CNC 정밀가공 30년 강소기업"
            className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo" />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1.5">복지·혜택</label>
          <input name="perks" placeholder="예) 기숙사·자격수당·정규전환"
            className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo" />
        </div>

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}
        <button type="submit" disabled={pending}
          className="w-full rounded-xl bg-indigo text-white py-3.5 font-semibold text-base hover:bg-indigo/90 transition-colors disabled:opacity-60">
          {pending ? "등록 중…" : "기업 회원 등록"}
        </button>
        <p className="text-xs text-muted text-center">
          데모 모드에서는 목업 목록에 즉시 추가되며, ‘더미데이터 복원’으로 되돌릴 수 있습니다.
        </p>
      </form>
    </div>
  );
}
