"use client";

import { useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import KeywordPicker from "@/components/KeywordPicker";
import { saveMatchKeywords, type ActionState } from "@/lib/actions";
import {
  extractKeywords,
  rankCompaniesByKeywords,
  type HashtaggableCompany,
} from "@/lib/keywords";

export interface StudioCompany extends HashtaggableCompany {
  id: string;
  name: string;
  region: string;
  intro: string;
}

const SAMPLE = `이커머스 스타트업에서 프론트엔드 개발자로 일하고 싶습니다.
React와 TypeScript로 웹을 만들고, Node.js 백엔드도 다뤄봤습니다.
Figma로 UI디자인·프로토타이핑을 하고, 데이터분석 기반으로 개선하는 걸 좋아합니다.
서울·판교 지역을 선호합니다.`;

export default function MatchStudio({
  companies,
  initialKeywords = [],
}: {
  companies: StudioCompany[];
  initialKeywords?: string[];
}) {
  const [text, setText] = useState("");
  const [analyzed, setAnalyzed] = useState(initialKeywords.length > 0);
  const [extracted, setExtracted] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>(initialKeywords);
  const [fileName, setFileName] = useState<string | null>(null);
  const pickerKey = useRef(0);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveMatchKeywords, {});

  const ranked = useMemo(
    () => (selected.length ? rankCompaniesByKeywords(selected, companies).filter((r) => r.match.score > 0) : []),
    [selected, companies],
  );

  const analyze = (source?: string) => {
    const src = source ?? text;
    const hits = extractKeywords(src).map((h) => h.keyword);
    setExtracted(hits);
    // 자동추출 결과를 기존 선택에 합쳐 초기 선택으로.
    const merged = Array.from(new Set([...selected, ...hits]));
    setSelected(merged);
    setAnalyzed(true);
    pickerKey.current += 1; // KeywordPicker 재마운트로 initialSelected 반영
  };

  const onFile = async (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    if (/\.(txt|md|csv)$/i.test(file.name)) {
      const t = await file.text();
      setText((prev) => (prev ? prev + "\n" + t : t));
    }
  };

  const useSample = () => {
    setText(SAMPLE);
    analyze(SAMPLE);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
      {/* ── 왼쪽: 입력 + 키워드 정리 ── */}
      <div className="space-y-8 min-w-0">
        {/* STEP 1 — 입력 */}
        <section className="rounded-[18px] border border-line p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-indigo text-white text-xs font-bold w-5 h-5 grid place-items-center">1</span>
            <h2 className="font-bold">원하는 서류 · 직무 내용을 넣어주세요</h2>
          </div>
          <p className="text-xs text-muted mb-4">
            지원하려는 공고 문구, 이력서, "이런 회사 가고 싶다"는 메모 무엇이든 좋아요. AI가 키워드를 뽑아드립니다.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder="예) 성남 지역 스마트팩토리 회사에서 Java·Spring 백엔드 개발을 하고 싶어요. MES 데이터 분석 경험 있습니다…"
            className="w-full rounded-xl border border-line px-4 py-3 text-sm focus:outline-none focus:border-indigo resize-none"
          />
          {/* 눈에 확 띄는 첨부 영역 — 카드 전체가 클릭됨 */}
          <label className="group mt-4 flex items-center gap-3 rounded-2xl border-2 border-dashed border-indigo/40 bg-indigo-soft/40 px-4 py-4 cursor-pointer hover:border-indigo hover:bg-indigo-soft/70 transition-colors">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-indigo text-white text-xl shrink-0">📎</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-ink">
                {fileName ? "다른 파일로 바꾸기" : "이력서 파일 첨부하기"}
              </span>
              <span className="block text-xs text-muted truncate">
                {fileName ? `✓ ${fileName}` : "PDF · TXT 파일을 눌러서 올려주세요 (선택)"}
              </span>
            </span>
            <span className="rounded-full bg-indigo text-white px-5 py-2.5 text-sm font-semibold shrink-0 group-hover:bg-indigo/90 transition-colors">
              파일 선택
            </span>
            <input
              type="file"
              accept=".pdf,.txt,.md,.csv,.doc,.docx"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={useSample}
              className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:border-indigo hover:text-indigo transition-colors"
            >
              샘플로 체험
            </button>
            <button
              type="button"
              onClick={() => analyze()}
              disabled={!text.trim()}
              className="ml-auto rounded-full bg-indigo text-white px-6 py-2.5 text-sm font-semibold hover:bg-indigo/90 transition-colors disabled:opacity-40"
            >
              ✨ 키워드 분석
            </button>
          </div>
          {fileName && /\.pdf$/i.test(fileName) && (
            <p className="mt-2 text-xs text-amber-600">
              PDF는 내용 자동 추출이 제한돼요. 핵심 문장을 위 칸에 붙여넣으면 더 정확합니다.
            </p>
          )}
        </section>

        {/* STEP 2 — 키워드 정리 */}
        {analyzed && (
          <section className="rounded-[18px] border border-line p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-indigo text-white text-xs font-bold w-5 h-5 grid place-items-center">2</span>
              <h2 className="font-bold">키워드를 골라주세요</h2>
            </div>
            <p className="text-xs text-muted mb-5">
              ✨ 표시는 방금 자동으로 찾은 키워드예요. 필요 없으면 끄고, 없는 건 직접 추가하세요.
            </p>
            <KeywordPicker
              key={pickerKey.current}
              initialSelected={selected}
              extracted={extracted}
              onChange={setSelected}
            />

            {/* STEP 3 — 서브밋 */}
            <form action={formAction} className="mt-8 border-t border-line pt-6">
              {selected.map((s) => (
                <input key={s} type="hidden" name="keywords" value={s} />
              ))}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold">
                  {selected.length}개 키워드 선택됨
                </span>
                {state.ok && <span className="text-sm text-indigo font-medium">✓ 저장했어요! 매칭에 반영됩니다.</span>}
                {state.error && <span className="text-sm text-red-500">{state.error}</span>}
                <button
                  disabled={pending || selected.length === 0}
                  className="ml-auto rounded-full bg-ink text-white px-7 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {pending ? "저장 중…" : "이 키워드로 매칭하기 →"}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>

      {/* ── 오른쪽: 실시간 매칭 ── */}
      <aside className="lg:sticky lg:top-6 rounded-[18px] border border-line p-6 bg-indigo-soft/30">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold">실시간 매칭</h2>
          <span className="badge badge-confirmed">LIVE</span>
        </div>
        <p className="text-xs text-muted mb-5">키워드를 고르면 바로 갱신돼요.</p>

        {ranked.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">
            아직 겹치는 회사가 없어요.<br />왼쪽에서 키워드를 골라보세요.
          </p>
        ) : (
          <ul className="space-y-3">
            {ranked.slice(0, 6).map(({ company, match }) => (
              <li key={company.id} className="rounded-xl bg-white border border-line p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm">{company.name}</span>
                  <span className="text-xs font-bold text-indigo">{match.score}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden">
                  <div className="h-full bg-indigo rounded-full" style={{ width: `${match.score}%` }} />
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {match.hits.slice(0, 4).map((h) => (
                    <span key={h} className="text-[11px] rounded-full bg-lime/40 text-ink px-2 py-0.5 font-medium">
                      #{h}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
