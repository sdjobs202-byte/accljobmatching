/**
 * 키워드 중간매칭 엔진 (해시태그 기반).
 *
 * PLAN.md 매칭 원칙의 "앞단"에 얹는 레이어:
 *   원하는 서류/직무 텍스트 → 키워드 추출 → 카테고리별 해시태그로 정리
 *   → 학생이 고르거나 직접 추가(있는 키워드는 뜨고, 없는 키워드는 만든다)
 *   → 기업 해시태그와 겹침 정도로 실시간 매칭.
 *
 * 순수 함수만 두어 서버/클라이언트 어디서나 재사용한다(외부 의존성 X).
 */

export type KeywordCategory = "industry" | "tech" | "design" | "role";

export interface CategoryMeta {
  key: KeywordCategory;
  label: string;
  emoji: string;
  hint: string;
  /** 칩 배경 클래스(선택 시). globals.css 토큰 기반. */
  tone: "indigo" | "sky" | "violet" | "lime";
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "industry", label: "업체 종류", emoji: "🏢", hint: "어떤 종류의 회사를 원하나요", tone: "indigo" },
  { key: "tech", label: "기술 · 백엔드", emoji: "⚙️", hint: "소프트웨어 · 개발 스택", tone: "sky" },
  { key: "design", label: "UI · UX", emoji: "🎨", hint: "화면 · 디자인 역량", tone: "violet" },
  { key: "role", label: "직무 · 역량", emoji: "🧰", hint: "맡을 일 · 보유 역량", tone: "lime" },
];

export const CATEGORY_BY_KEY: Record<KeywordCategory, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<KeywordCategory, CategoryMeta>;

/** 카테고리별 기본 키워드 은행(있는 키워드는 여기서 뜬다). 범용 + 제조계열 포함. */
export const KEYWORD_BANK: Record<KeywordCategory, string[]> = {
  industry: [
    "IT/SW", "스타트업", "대기업", "공공기관", "금융/핀테크", "이커머스",
    "게임", "미디어/콘텐츠", "마케팅/광고", "교육", "의료/바이오", "유통/물류",
    "건설/엔지니어링", "제조/정밀가공", "로봇/자동화", "스마트팩토리", "이차전지",
  ],
  tech: [
    "Java", "Spring", "Python", "JavaScript", "TypeScript", "React", "Vue",
    "Node.js", "SQL", "MySQL", "AWS", "Docker", "Git", "REST API", "HTML/CSS",
    "Kotlin", "데이터분석", "머신러닝", "PLC", "MES", "ERP", "임베디드",
  ],
  design: [
    "Figma", "UI디자인", "UX리서치", "반응형웹", "웹퍼블리싱", "프로토타이핑",
    "디자인시스템", "와이어프레임", "그래픽디자인", "브랜딩", "포토샵",
    "일러스트레이터", "접근성", "인터랙션", "UX라이팅",
  ],
  role: [
    "백엔드개발", "프론트엔드", "풀스택", "앱개발", "데이터엔지니어", "기획/PM",
    "마케팅", "영업", "디자이너", "QA", "인사/HR", "회계/재무", "고객지원",
    "콘텐츠기획", "데이터분석가", "기계설계", "자동화", "품질관리", "CNC", "캐드",
  ],
};

/** 키워드 → 카테고리 역인덱스. */
const CATEGORY_OF = new Map<string, KeywordCategory>();
for (const cat of Object.keys(KEYWORD_BANK) as KeywordCategory[]) {
  for (const kw of KEYWORD_BANK[cat]) CATEGORY_OF.set(kw.toLowerCase(), cat);
}

/**
 * 사용자가 실제로 쓰는 표현(별칭) → 표준 키워드. 추출 정확도를 올린다.
 * 주의: "js"·"ui"·"cs" 같은 2글자 영문 별칭은 다른 단어에 부분일치해 오탐을 내므로 넣지 않는다.
 */
const SYNONYMS: Record<string, string> = {
  // ── 기술·백엔드 ──
  리액트: "React", react: "React",
  노드: "Node.js", nodejs: "Node.js", "node.js": "Node.js",
  스프링: "Spring", spring: "Spring", 스프링부트: "Spring", springboot: "Spring",
  자바: "Java", 자바스크립트: "JavaScript", javascript: "JavaScript",
  파이썬: "Python", python: "Python",
  타입스크립트: "TypeScript", typescript: "TypeScript",
  뷰: "Vue", vuejs: "Vue",
  코틀린: "Kotlin", kotlin: "Kotlin",
  피그마: "Figma", figma: "Figma",
  에이더블유에스: "AWS",
  도커: "Docker", docker: "Docker",
  마이에스큐엘: "MySQL", mysql: "MySQL",
  데이터베이스: "SQL", 디비: "SQL",
  퍼블리싱: "웹퍼블리싱", 퍼블리셔: "웹퍼블리싱", 웹퍼블리싱: "웹퍼블리싱",
  머신러닝: "머신러닝", 인공지능: "머신러닝",
  임베디드: "임베디드",
  plc: "PLC", mes: "MES", erp: "ERP",
  // ── 직무·역량 ──
  백엔드: "백엔드개발", backend: "백엔드개발", 서버개발: "백엔드개발", 서버개발자: "백엔드개발",
  프론트: "프론트엔드", 프론트엔드: "프론트엔드", frontend: "프론트엔드", 프론트엔드개발: "프론트엔드",
  풀스택: "풀스택", fullstack: "풀스택",
  앱개발: "앱개발", 안드로이드: "앱개발", 아이폰: "앱개발", 모바일개발: "앱개발",
  데이터엔지니어: "데이터엔지니어",
  데이터분석: "데이터분석", 데이터분석가: "데이터분석가",
  기획: "기획/PM", 프로덕트매니저: "기획/PM", 프로덕트: "기획/PM", 서비스기획: "기획/PM",
  마케팅: "마케팅", 마케터: "마케팅", 퍼포먼스마케팅: "마케팅",
  콘텐츠기획: "콘텐츠기획", 콘텐츠: "콘텐츠기획",
  영업: "영업", 세일즈: "영업",
  디자이너: "디자이너", 디자인: "UI디자인", ui디자인: "UI디자인",
  유엑스: "UX리서치", ux리서치: "UX리서치", 사용자리서치: "UX리서치",
  인사: "인사/HR", 채용: "인사/HR", 인사담당: "인사/HR",
  회계: "회계/재무", 재무: "회계/재무",
  고객지원: "고객지원", 고객상담: "고객지원", 상담사: "고객지원",
  품질: "품질관리", 품질관리: "품질관리",
  씨엔씨: "CNC", cnc: "CNC",
  캐드: "캐드", cad: "캐드",
  기계설계: "기계설계",
  테스트: "QA", 테스터: "QA", 품질검증: "QA",
  // ── 업체 종류 ──
  스타트업: "스타트업", 대기업: "대기업",
  공공기관: "공공기관", 공기업: "공공기관", 공공: "공공기관",
  핀테크: "금융/핀테크", 금융: "금융/핀테크",
  이커머스: "이커머스", 커머스: "이커머스", 쇼핑몰: "이커머스",
  게임: "게임", 게임회사: "게임",
  미디어: "미디어/콘텐츠", 콘텐츠회사: "미디어/콘텐츠",
  광고: "마케팅/광고", 광고대행사: "마케팅/광고",
  교육: "교육", 에듀테크: "교육",
  의료: "의료/바이오", 바이오: "의료/바이오", 헬스케어: "의료/바이오",
  물류: "유통/물류", 유통: "유통/물류",
  건설: "건설/엔지니어링",
  반도체: "제조/정밀가공", 자동차부품: "제조/정밀가공", 정밀가공: "제조/정밀가공", 가공: "제조/정밀가공",
  이차전지: "이차전지", 배터리: "이차전지",
  자동화: "자동화", 로봇: "로봇/자동화", 협동로봇: "로봇/자동화",
  스마트팩토리: "스마트팩토리",
  // ── UI·UX ──
  반응형: "반응형웹",
  프로토타입: "프로토타이핑", 프로토타이핑: "프로토타이핑",
  그래픽: "그래픽디자인", 포토샵: "포토샵", 일러스트: "일러스트레이터", 일러스트레이터: "일러스트레이터",
  브랜딩: "브랜딩", 접근성: "접근성",
};

export interface KeywordHit {
  keyword: string;
  category: KeywordCategory;
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ");

/**
 * 텍스트에서 키워드를 뽑아 카테고리별로 정리한다.
 * 표준 키워드 은행 + 별칭 사전을 부분일치로 스캔한다.
 */
export function extractKeywords(text: string): KeywordHit[] {
  if (!text.trim()) return [];
  const hay = norm(text);
  const found = new Map<string, KeywordCategory>();

  // 1) 표준 키워드 직접 매칭
  for (const [kwLower, cat] of CATEGORY_OF) {
    if (hay.includes(kwLower)) {
      const canonical = KEYWORD_BANK[cat].find((k) => k.toLowerCase() === kwLower)!;
      found.set(canonical, cat);
    }
  }
  // 2) 별칭 매칭 → 표준으로 환원
  for (const alias of Object.keys(SYNONYMS)) {
    if (hay.includes(alias)) {
      const canonical = SYNONYMS[alias];
      const cat = categoryOf(canonical);
      if (cat) found.set(canonical, cat);
    }
  }

  return [...found.entries()].map(([keyword, category]) => ({ keyword, category }));
}

/** 키워드가 속한 카테고리(은행 기준). 없으면 undefined(사용자 커스텀). */
export function categoryOf(keyword: string): KeywordCategory | undefined {
  return CATEGORY_OF.get(keyword.toLowerCase());
}

// ── 기업 해시태그 ─────────────────────────────────────
/** 업종 → 대표 해시태그. hashtags가 비었을 때 자연스럽게 채워준다. */
const INDUSTRY_HASHTAGS: Record<string, string[]> = {
  // IT·서비스
  "IT/SW": ["IT/SW", "React", "Node.js", "TypeScript", "백엔드개발", "프론트엔드"],
  스타트업: ["스타트업", "React", "풀스택", "기획/PM", "마케팅"],
  "금융/핀테크": ["금융/핀테크", "Java", "Spring", "데이터분석", "백엔드개발"],
  이커머스: ["이커머스", "React", "Node.js", "프론트엔드", "데이터분석", "마케팅"],
  게임: ["게임", "C++", "앱개발", "그래픽디자인", "QA"],
  "미디어/콘텐츠": ["미디어/콘텐츠", "콘텐츠기획", "브랜딩", "UX라이팅", "마케팅"],
  "마케팅/광고": ["마케팅/광고", "마케팅", "콘텐츠기획", "데이터분석", "브랜딩"],
  교육: ["교육", "콘텐츠기획", "기획/PM", "프론트엔드"],
  "의료/바이오": ["의료/바이오", "데이터분석", "품질관리", "Python"],
  "유통/물류": ["유통/물류", "데이터분석", "SQL", "고객지원"],
  공공기관: ["공공기관", "Java", "Spring", "품질관리"],
  // 제조·엔지니어링
  "기계/정밀가공": ["제조/정밀가공", "CNC", "캐드", "기계설계", "품질관리"],
  "로봇/자동화": ["로봇/자동화", "PLC", "자동화", "임베디드"],
  이차전지: ["이차전지", "품질관리", "데이터분석", "MES"],
  스마트팩토리: ["스마트팩토리", "MES", "데이터엔지니어", "SQL"],
  "전기/전자": ["제조/정밀가공", "임베디드", "품질관리"],
  "건설/엔지니어링": ["건설/엔지니어링", "캐드", "품질관리"],
};

export interface HashtaggableCompany {
  hashtags?: string[];
  industry?: string;
}

/** 회사의 해시태그(명시값 우선, 없으면 업종에서 유도). */
export function companyHashtags(c: HashtaggableCompany): string[] {
  if (c.hashtags && c.hashtags.length) return c.hashtags;
  if (c.industry && INDUSTRY_HASHTAGS[c.industry]) return INDUSTRY_HASHTAGS[c.industry];
  return c.industry ? [c.industry] : [];
}

// ── 매칭 점수 ────────────────────────────────────────
export interface HashtagMatch {
  score: number;      // 0~100
  hits: string[];     // 겹친 해시태그
}

/**
 * 내가 고른 키워드 ↔ 회사 해시태그 겹침 점수.
 * "내가 원하는 것을 이 회사가 얼마나 갖췄나(coverage)"와
 * "이 회사가 내 관심에 얼마나 집중돼 있나(focus)"를 6:4로 섞는다.
 */
export function scoreHashtagMatch(selected: string[], target: string[]): HashtagMatch {
  if (!selected.length || !target.length) return { score: 0, hits: [] };
  const sel = new Set(selected.map((s) => s.toLowerCase()));
  const hits = target.filter((t) => sel.has(t.toLowerCase()));
  if (!hits.length) return { score: 0, hits: [] };
  const coverage = hits.length / selected.length;
  const focus = hits.length / target.length;
  const score = Math.round(Math.min(100, coverage * 60 + focus * 40 + 8));
  return { score, hits };
}

export interface RankedCompany<T> {
  company: T;
  match: HashtagMatch;
}

/** 회사 목록을 내가 고른 키워드 기준 적합도순으로 정렬. */
export function rankCompaniesByKeywords<T extends HashtaggableCompany>(
  selected: string[],
  companies: T[],
): RankedCompany<T>[] {
  return companies
    .map((company) => ({ company, match: scoreHashtagMatch(selected, companyHashtags(company)) }))
    .sort((a, b) => b.match.score - a.match.score);
}
