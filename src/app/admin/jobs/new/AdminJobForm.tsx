"use client";

import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import { EMPLOYMENT_LABEL, type EmploymentType } from "@/lib/types";
import { adminCreateJob, type ActionState } from "@/lib/actions";

const SKILL_OPTIONS = [
  "CNC", "캐드", "Solidworks", "PLC", "임베디드", "협동로봇",
  "품질관리", "데이터분석", "SQL", "NoSQL", "설비", "MES",
  "머신러닝", "딥러닝", "영상인식", "자연어처리", "데이터마이닝", "텍스트마이닝", "웹크롤링",
  "파이썬", "자바", "JSP", "C++", "C#", "Flutter", "Flask", "자바스크립트", "TypeScript",
  "리액트", "Node.js", "스프링", "Unity", "AWS", "클라우드", "Docker", "Git",
];
const JOB_CATEGORIES = [
  "기계설계", "자동화", "공장자동화", "물류자동화", "품질관리", "스마트팩토리",
  "웹개발", "백엔드개발", "프론트엔드", "앱개발", "임베디드개발", "서버관리",
  "인공지능", "데이터분석가", "데이터엔지니어", "클라이언트개발", "게임기획", "게임운영",
];
const REGIONS = ["성남", "판교", "용인", "수원", "서울", "기타"];

export interface CompanyOption {
  id: string;
  name: string;
}

export default function AdminJobForm({ companies }: { companies: CompanyOption[] }) {
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(adminCreateJob, {});

  const toggleSkill = (s: string) =>
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const addCustom = () => {
    const v = customSkill.trim();
    if (v && !skills.includes(v)) {
      setSkills((prev) => [...prev, v]);
      setCustomSkill("");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-8 py-12">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold">공고 등록 (관리자)</h1>
        <Link href="/admin/jobs" className="text-sm text-muted hover:text-indigo">← 공고 관리</Link>
      </div>
      <p className="text-sm text-muted mb-8">등록할 회사를 선택하고 공고를 작성합니다.</p>

      <form action={formAction} className="space-y-7">
        {skills.map((s) => <input key={s} type="hidden" name="skills" value={s} />)}

        <div>
          <label className="text-sm font-semibold block mb-1.5">회사 <span className="text-indigo">*</span></label>
          <select name="companyId" required defaultValue=""
            className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo">
            <option value="">회사 선택</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {companies.length === 0 && (
            <p className="text-xs text-amber-600 mt-1.5">
              등록된 회사가 없습니다. 먼저 <Link href="/admin/companies/new" className="underline">기업을 등록</Link>해주세요.
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1.5">공고 제목 <span className="text-indigo">*</span></label>
          <input name="title" required placeholder="예) CNC 가공 엔지니어 (신입)"
            className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1.5">직무 카테고리 <span className="text-indigo">*</span></label>
            <select name="jobCategory" required defaultValue=""
              className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo">
              <option value="">선택</option>
              {JOB_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5">고용형태 <span className="text-indigo">*</span></label>
            <select name="employmentType" className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo">
              {(Object.entries(EMPLOYMENT_LABEL) as [EmploymentType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1.5">근무 지역 <span className="text-indigo">*</span></label>
          <select name="region" className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo">
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-2">필요 역량 태그</label>
          <p className="text-xs text-muted mb-3">선택한 태그가 AI 매칭 기준이 됩니다.</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {SKILL_OPTIONS.map((s) => (
              <button key={s} type="button" onClick={() => toggleSkill(s)}
                className={`rounded-full px-3 py-1.5 text-sm border font-medium transition-colors ${
                  skills.includes(s) ? "bg-indigo text-white border-indigo" : "border-line hover:border-indigo"
                }`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={customSkill} onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
              placeholder="직접 입력 후 Enter"
              className="flex-1 rounded-full border border-line px-4 py-2 text-sm focus:outline-none focus:border-indigo" />
            <button type="button" onClick={addCustom}
              className="rounded-full border border-indigo text-indigo px-4 py-2 text-sm font-semibold hover:bg-indigo hover:text-white transition-colors">
              추가
            </button>
          </div>
          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-full bg-indigo text-white px-3 py-1 text-xs font-semibold">
                  {s}
                  <button type="button" onClick={() => toggleSkill(s)} className="opacity-70 hover:opacity-100 leading-none">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1.5">공고 상세 내용</label>
          <textarea name="description" rows={6}
            placeholder="주요 업무, 자격 요건, 우대사항 등을 자유롭게 작성해주세요"
            className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo resize-none" />
        </div>

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}
        <button type="submit" disabled={pending}
          className="w-full rounded-xl bg-indigo text-white py-3.5 font-semibold text-base hover:bg-indigo/90 transition-colors disabled:opacity-60">
          {pending ? "등록 중…" : "공고 등록"}
        </button>
      </form>
    </div>
  );
}
