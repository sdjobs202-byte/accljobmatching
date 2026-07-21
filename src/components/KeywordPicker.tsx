"use client";

import { useMemo, useState } from "react";
import {
  CATEGORIES,
  KEYWORD_BANK,
  categoryOf,
  type KeywordCategory,
} from "@/lib/keywords";

/**
 * 해시태그 키워드 선택기 (재사용).
 * - 카테고리별로 "있는 키워드"는 칩으로 뜨고, 클릭해서 켜고 끈다.
 * - "없는 키워드"는 각 카테고리 하단 입력창으로 직접 추가한다.
 * - extracted(자동추출)로 들어온 키워드는 ✨ 로 표시한다.
 * - 상태는 내부에서 관리하고, 바뀔 때마다 onChange(flat list)를 호출한다.
 */
const TONE_ON: Record<string, string> = {
  indigo: "bg-indigo text-white border-indigo",
  sky: "bg-sky-600 text-white border-sky-600",
  violet: "bg-violet-600 text-white border-violet-600",
  lime: "bg-lime text-ink border-lime",
};

export interface KeywordPickerProps {
  /** 표시할 카테고리(기본: 전체). */
  categories?: KeywordCategory[];
  /** 초기 선택 키워드. */
  initialSelected?: string[];
  /** 자동추출된 키워드(✨ 강조). */
  extracted?: string[];
  onChange?: (selected: string[]) => void;
  /** hidden input 으로 폼 전송할 때 사용할 name. */
  name?: string;
  compact?: boolean;
}

export default function KeywordPicker({
  categories,
  initialSelected = [],
  extracted = [],
  onChange,
  name,
  compact = false,
}: KeywordPickerProps) {
  const cats = useMemo(
    () => CATEGORIES.filter((c) => !categories || categories.includes(c.key)),
    [categories],
  );

  const [selected, setSelected] = useState<string[]>(initialSelected);
  // 은행에 없는 사용자 커스텀 키워드를 카테고리별로 기억(칩 렌더용).
  const [customByCat, setCustomByCat] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    for (const kw of initialSelected) {
      if (!categoryOf(kw)) {
        const c = "role"; // 카테고리 미상 커스텀은 직무로 귀속
        (init[c] ??= []).push(kw);
      }
    }
    return init;
  });
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const extractedSet = useMemo(() => new Set(extracted.map((k) => k.toLowerCase())), [extracted]);

  const commit = (next: string[]) => {
    setSelected(next);
    onChange?.(next);
  };

  const toggle = (kw: string) =>
    commit(selected.includes(kw) ? selected.filter((x) => x !== kw) : [...selected, kw]);

  const addCustom = (cat: KeywordCategory) => {
    const v = (drafts[cat] ?? "").trim();
    if (!v) return;
    if (!selected.includes(v)) commit([...selected, v]);
    if (!categoryOf(v)) {
      setCustomByCat((prev) => {
        const list = prev[cat] ?? [];
        return list.includes(v) ? prev : { ...prev, [cat]: [...list, v] };
      });
    }
    setDrafts((prev) => ({ ...prev, [cat]: "" }));
  };

  const chipsFor = (cat: KeywordCategory) => {
    const bank = KEYWORD_BANK[cat];
    const custom = (customByCat[cat] ?? []).filter((k) => !bank.includes(k));
    return [...bank, ...custom];
  };

  return (
    <div className={compact ? "space-y-5" : "space-y-7"}>
      {/* 폼 전송용 hidden inputs */}
      {name && selected.map((s) => <input key={s} type="hidden" name={name} value={s} />)}

      {cats.map((cat) => (
        <div key={cat.key}>
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-base">{cat.emoji}</span>
            <span className="text-sm font-bold">{cat.label}</span>
            <span className="text-xs text-muted">{cat.hint}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {chipsFor(cat.key).map((kw) => {
              const on = selected.includes(kw);
              const isNew = extractedSet.has(kw.toLowerCase());
              return (
                <button
                  key={kw}
                  type="button"
                  onClick={() => toggle(kw)}
                  className={`rounded-full px-3 py-1.5 text-sm border font-medium transition-colors ${
                    on ? TONE_ON[cat.tone] : "border-line text-ink/70 hover:border-indigo"
                  }`}
                >
                  {isNew && !on ? "✨ " : ""}
                  {kw}
                </button>
              );
            })}
          </div>

          {/* 없는 키워드 직접 추가 */}
          <div className="mt-2.5 flex gap-2">
            <input
              value={drafts[cat.key] ?? ""}
              onChange={(e) => setDrafts((p) => ({ ...p, [cat.key]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom(cat.key);
                }
              }}
              placeholder={`${cat.label} 키워드 직접 추가`}
              className="flex-1 rounded-full border border-line px-4 py-1.5 text-sm focus:outline-none focus:border-indigo"
            />
            <button
              type="button"
              onClick={() => addCustom(cat.key)}
              className="rounded-full border border-indigo text-indigo px-4 py-1.5 text-sm font-semibold hover:bg-indigo hover:text-white transition-colors whitespace-nowrap"
            >
              + 추가
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
