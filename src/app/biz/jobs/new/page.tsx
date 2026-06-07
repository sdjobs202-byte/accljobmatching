"use client";
import { useState } from "react";
import { useActionState } from "react";
import { EMPLOYMENT_LABEL, type EmploymentType } from "@/lib/types";
import { createJob, type ActionState } from "@/lib/actions";

const SKILL_OPTIONS = [
  "CNC", "캐드", "측정", "PLC", "전기제어", "협동로봇",
  "품질", "데이터분석", "엑셀", "SQL", "설비", "MES",
  "3D프린팅", "용접", "CAM",
];
const JOB_CATEGORIES = ["기계설계", "자동화", "품질관리", "데이터", "스마트팩토리", "전기제어"];
const REGIONS = ["성남", "판교", "용인", "수원", "서울", "기타"];

export default function NewJobPage() {
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createJob, {});

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
    <div className="mx-auto max-w-2xl px-5 py-14">
      <h1 className="hail text-3xl mb-1">좋은 사람, 여기서 만난다.</h1>
      <p className="text-sm text-muted mb-10">공고를 등록하면 AI가 적합한 학생을 점수순으로 추려줍니다.</p>

      <form action={formAction} className="space-y-7">
        {skills.map((s) => <input key={s} type="hidden" name="skills" value={s} />)}
        <div>
          <label className="text-sm font-semibold block mb-1.5">
            공고 제목 <span className="text-indigo">*</span>
          </label>
          <input
            name="title"
            required
            placeholder="예) CNC 가공 엔지니어 (신입)"
            className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1.5">
              직무 카테고리 <span className="text-indigo">*</span>
            </label>
            <select name="jobCategory" required className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo">
              <option value="">선택</option>
              {JOB_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5">
              고용형태 <span className="text-indigo">*</span>
            </label>
            <select name="employmentType" className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo">
              {(Object.entries(EMPLOYMENT_LABEL) as [EmploymentType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1.5">
            근무 지역 <span className="text-indigo">*</span>
          </label>
          <select name="region" className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo">
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-2">
            필요 역량 태그 <span className="text-indigo">*</span>
          </label>
          <p className="text-xs text-muted mb-3">선택한 태그가 AI 매칭 기준이 됩니다.</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {SKILL_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSkill(s)}
                className={`rounded-full px-3 py-1.5 text-sm border font-medium transition-colors ${
                  skills.includes(s)
                    ? "bg-indigo text-white border-indigo"
                    : "border-line hover:border-indigo"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
              placeholder="직접 입력 후 Enter"
              className="flex-1 rounded-full border border-line px-4 py-2 text-sm focus:outline-none focus:border-indigo"
            />
            <button
              type="button"
              onClick={addCustom}
              className="rounded-full border border-indigo text-indigo px-4 py-2 text-sm font-semibold hover:bg-indigo hover:text-white transition-colors"
            >
              추가
            </button>
          </div>
          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo text-white px-3 py-1 text-xs font-semibold"
                >
                  {s}
                  <button type="button" onClick={() => toggleSkill(s)} className="opacity-70 hover:opacity-100 leading-none">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1.5">
            공고 상세 내용 <span className="text-indigo">*</span>
          </label>
          <textarea
            name="description"
            rows={6}
            placeholder="주요 업무, 자격 요건, 우대사항 등을 자유롭게 작성해주세요"
            className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1.5">모집 인원</label>
            <input
              type="number"
              min="1"
              placeholder="1"
              className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5">마감일 (선택)</label>
            <input
              type="date"
              className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo"
            />
          </div>
        </div>

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-xl bg-indigo text-white py-3.5 font-semibold text-base hover:bg-indigo/90 transition-colors disabled:opacity-60"
          >
            {pending ? "등록 중…" : "공고 등록"}
          </button>
        </div>
        <p className="text-xs text-muted text-center">
          등록 후 운영자 승인을 거쳐 학생에게 공개됩니다.
        </p>
      </form>
    </div>
  );
}
