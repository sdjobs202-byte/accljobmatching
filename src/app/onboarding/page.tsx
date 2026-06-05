"use client";
import { useState } from "react";

const SKILL_OPTIONS = [
  "CNC", "캐드", "측정", "PLC", "전기제어", "협동로봇",
  "품질", "데이터분석", "엑셀", "SQL", "설비", "MES",
  "3D프린팅", "용접", "CAM",
];
const JOB_OPTIONS = ["기계설계", "자동화", "품질관리", "데이터", "스마트팩토리", "전기제어"];
const INDUSTRY_OPTIONS = ["기계/정밀가공", "로봇/자동화", "이차전지", "스마트팩토리", "전기/전자", "IT/SW"];
const REGIONS = ["성남", "판교", "용인", "수원", "서울", "기타"];
const GRAD_YEARS = ["2025", "2026", "2027"];

export default function OnboardingPage() {
  const [role, setRole] = useState<"student" | "company">("student");
  const [skills, setSkills] = useState<string[]>([]);
  const [jobs, setJobs] = useState<string[]>([]);

  const toggle = (arr: string[], item: string, set: (v: string[]) => void) =>
    set(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <p className="text-xs font-semibold text-indigo mb-3 tracking-widest">STEP 1 / 1 — 프로필 설정</p>
      <h1 className="hail text-3xl mb-1">
        {role === "student" ? "나를 보여줄 차례." : "회사를 소개해줘."}
      </h1>
      <p className="text-sm text-muted mb-8">가입 후 1번만 작성하면 돼요. 언제든 수정할 수 있어요.</p>

      {/* 역할 탭 */}
      <div className="flex gap-2 mb-10">
        {(["student", "company"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`rounded-full px-5 py-2 text-sm font-semibold border transition-colors ${
              role === r ? "bg-indigo text-white border-indigo" : "border-line hover:border-indigo"
            }`}
          >
            {r === "student" ? "학생" : "기업"}
          </button>
        ))}
      </div>

      {role === "student" ? (
        <form className="space-y-7">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5">학과 <span className="text-indigo">*</span></label>
              <input placeholder="스마트기계과" className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">졸업 예정년도 <span className="text-indigo">*</span></label>
              <select className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo">
                {GRAD_YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1.5">거주 지역 <span className="text-indigo">*</span></label>
            <select className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo">
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2">보유 역량 태그 <span className="text-indigo">*</span></label>
            <p className="text-xs text-muted mb-3">AI 매칭 점수에 직접 반영돼요. 최대한 많이 선택하세요.</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(skills, s, setSkills)}
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
            {skills.length > 0 && (
              <p className="text-xs text-indigo mt-2">{skills.length}개 선택됨</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2">희망 직무 <span className="text-indigo">*</span></label>
            <div className="flex flex-wrap gap-2">
              {JOB_OPTIONS.map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => toggle(jobs, j, setJobs)}
                  className={`rounded-full px-3 py-1.5 text-sm border font-medium transition-colors ${
                    jobs.includes(j)
                      ? "bg-lime text-ink border-lime"
                      : "border-line hover:border-indigo"
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1.5">한 줄 자기소개 (선택)</label>
            <textarea
              rows={3}
              placeholder="강점이나 관심 분야를 한 줄로 적어주세요"
              className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo resize-none"
            />
          </div>

          <button className="w-full rounded-xl bg-indigo text-white py-3.5 font-semibold text-base hover:bg-indigo/90 transition-colors">
            프로필 저장하고 시작
          </button>
        </form>
      ) : (
        <form className="space-y-7">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5">회사명 <span className="text-indigo">*</span></label>
              <input placeholder="한빛정밀" className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">업종 <span className="text-indigo">*</span></label>
              <select className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo">
                {INDUSTRY_OPTIONS.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1.5">사업장 소재지 <span className="text-indigo">*</span></label>
            <select className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo">
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1.5">회사 소개 <span className="text-indigo">*</span></label>
            <textarea
              rows={4}
              placeholder="강소기업으로서의 강점, 주요 사업 내용을 자유롭게 적어주세요"
              className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1.5">복리후생 / 우대사항</label>
            <input
              placeholder="기숙사·자격수당·정규전환"
              className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo"
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1.5">채용담당자 연락처 <span className="text-indigo">*</span></label>
            <input
              placeholder="010-0000-0000"
              className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo"
            />
          </div>

          <button className="w-full rounded-xl bg-indigo text-white py-3.5 font-semibold text-base hover:bg-indigo/90 transition-colors">
            회사 정보 저장하고 시작
          </button>
        </form>
      )}
    </div>
  );
}
