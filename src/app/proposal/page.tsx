import Link from "next/link";

export const metadata = {
  title: "개발 견적·제안서 — 대학생-기업 잡매칭 웹앱 | 스마택트",
  description: "대학생-기업 잡매칭 플랫폼 개발 견적 및 제안 (스마택트 → ACCL AI 커리어콘텐츠 연구소)",
};

// ── 작은 조립 블록 ─────────────────────────────
function Section({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-16 border-t border-line">
      <p className="text-sm font-semibold text-indigo">{kicker}</p>
      <h2 className="hail text-3xl sm:text-4xl mt-2 mb-8">{title}</h2>
      {children}
    </section>
  );
}

const FLOW = [
  ["01", "회원가입·로그인", "학생/기업 구분 · 개인정보 동의"],
  ["02", "기업 목록", "50개사 카드 그리드 · 조건 필터"],
  ["03", "기업·채용 상세", "직무·역량·우대조건"],
  ["04", "입사 지원", "이력서·자소서·포폴 첨부"],
  ["05", "지원서 검토", "기업이 점수순으로 확인"],
  ["06", "면접 확정", "확정/미확정 상태 관리"],
  ["07", "지원자 마이페이지", "지원현황·면접결과"],
  ["08", "관리자 대시보드", "회원·지원·매칭 퍼널"],
];

const SCREENS = [
  ["랜딩", "/", "호명 카피 · 역할별 진입 · 실시간 통계"],
  ["채용공고", "/companies", "적합도순 정렬 + AI 한 줄 코멘트"],
  ["기업·공고 상세", "/companies/c1", "공고 상세 · AI 매칭 코멘트 · 지원"],
  ["지원서 작성", "/apply/j1", "이력서·자소서·포폴 첨부"],
  ["마이페이지", "/me", "지원현황 · 면접확정 · 추천공고"],
  ["기업 지원자 검토", "/biz/applicants/j1", "적합도 점수순 · 면접 확정"],
  ["관리자 대시보드", "/admin", "KPI · 매칭 퍼널 시각화"],
];

const PLANS = [
  { name: "1안 · 수동 매칭", supply: "1,500만", vat: "1,650만", weeks: "약 4~5주",
    desc: "관리자가 지원서를 보고 직접 연결. 빠른 출시·초기 검증.", best: false },
  { name: "2안 · 조건필터 + AI 보조", supply: "1,800만", vat: "1,980만", weeks: "약 6~7주",
    desc: "직무·지역·역량 필터 정렬에 AI 적합도 점수·사유를 얹음. 가장 무난.", best: true },
  { name: "3안 · AI 자동매칭", supply: "2,200만", vat: "2,420만", weeks: "약 8~9주",
    desc: "프로필·이력 벡터화 후 자동 점수·랭킹·추천. 데이터 축적 후 단계.", best: false },
];

const SCOPE = [
  "회원가입·로그인 (학생/기업 구분, 개인정보 동의)",
  "기업 목록 (50개사) · 기업·채용 상세",
  "입사 지원서 제출 (이력서·자소서·포폴 첨부)",
  "기업용 지원서 검토 · 면접 확정/미확정",
  "지원자 마이페이지 (지원현황·결과)",
  "매칭 엔진 (조건필터 + AI 보조 점수)",
  "관리자 DB 대시보드 (회원·지원·매칭 현황)",
  "카카오 알림톡 / 문자 알림 연동",
];

export default function Proposal() {
  return (
    <div>
      {/* 표지 */}
      <section className="mx-auto max-w-5xl px-5 pt-20 pb-20 min-h-[88vh] flex flex-col justify-center">
        <p className="text-sm font-semibold text-indigo">개발 견적 · 제안서</p>
        <h1 className="hail text-5xl sm:text-7xl mt-4 max-w-3xl">
          대학생-기업<br /><span className="bg-lime px-2">잡매칭 웹앱.</span>
        </h1>
        <p className="mt-6 text-lg text-muted max-w-xl">
          조건필터 + AI 보조 매칭으로, 지원부터 면접 확정까지 한 흐름으로 잇는 반응형 웹앱 구축 제안.
        </p>
        <div className="mt-12 grid sm:grid-cols-2 gap-4 max-w-2xl">
          <div className="rounded-[18px] border border-line p-6">
            <div className="text-xs text-muted">받는 곳 (발주)</div>
            <div className="mt-1 text-xl font-bold">ACCL AI 커리어콘텐츠 연구소</div>
            <div className="text-sm text-muted">강희승 대표님 귀하</div>
          </div>
          <div className="rounded-[18px] border border-line p-6">
            <div className="text-xs text-muted">드리는 곳 (개발)</div>
            <div className="mt-1 text-xl font-bold">스마택트</div>
            <div className="text-sm text-muted">조진영 · smartact.kr</div>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted">작성일 2026-06-04 · 본 견적은 상세 기능 협의 시 조정될 수 있습니다.</p>
      </section>

      {/* HERO */}
      <section className="mx-auto max-w-5xl px-5 pt-16 pb-14 border-t border-line">
        <p className="text-sm font-semibold text-indigo mb-4">한눈에 보기</p>
        <h1 className="hail text-5xl sm:text-6xl max-w-3xl">
          학생과 기업을,<br /><span className="bg-lime px-2">가장 가까운 거리로.</span>
        </h1>
        <p className="mt-6 text-lg text-muted max-w-2xl">
          대학생 400~500명 규모와 채용기업 50개사를 잇는 잡매칭 웹앱. 조건에 맞는 기업을 정렬하고,
          AI가 적합도와 한 줄 이유까지 — 지원부터 면접 확정까지 한 흐름으로 잇습니다.
        </p>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {[["발주", "ACCL AI 커리어콘텐츠 연구소"], ["개발", "스마택트"], ["형태", "반응형 웹앱"], ["기간", "약 6~7주(2안)"]].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-line p-4">
              <div className="text-muted text-xs">{k}</div>
              <div className="font-bold mt-1">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/" className="rounded-full bg-indigo text-white px-6 py-3 font-semibold">▶ 라이브 데모 바로 보기</Link>
          <span className="ml-3 text-sm text-muted">* 아래 모든 화면은 이미 실제로 구현되어 클릭해볼 수 있습니다.</span>
        </div>
      </section>

      {/* 배경 */}
      <Section kicker="WHY NOW" title="왜 지금, 자체 플랫폼인가">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            ["흩어진 채용 정보", "공고가 메일·게시판·전화로 흩어져 학생도 기업도 놓칩니다."],
            ["매칭의 비효율", "수작업 연결은 담당자 한 명에게 병목이 걸립니다."],
            ["데이터의 부재", "누가 어디에 지원했고 왜 매칭됐는지 기록이 남지 않습니다."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-[18px] border border-line p-6">
              <div className="font-bold">{t}</div>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-ink/80">
          → <b className="text-indigo">한 곳에 모으고, 조건으로 정렬하고, AI가 이유를 붙이고, 모든 흐름을 기록</b>합니다.
        </p>
      </Section>

      {/* 솔루션 8단계 */}
      <Section kicker="SOLUTION" title="지원에서 매칭까지, 8단계 한 흐름">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FLOW.map(([n, t, d]) => (
            <div key={n} className="rounded-[18px] border border-line p-5">
              <span className="inline-flex w-9 h-9 rounded-lg bg-indigo text-white items-center justify-center font-bold text-sm">{n}</span>
              <div className="mt-3 font-bold">{t}</div>
              <p className="mt-1 text-xs text-muted">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 실제 구현 미리보기 */}
      <Section kicker="LIVE PREVIEW" title="이미 만들어 둔 화면, 직접 눌러보세요">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCREENS.map(([t, href, d]) => (
            <Link key={href} href={href}
              className="group rounded-[18px] border border-line overflow-hidden hover:border-indigo transition-colors">
              <div className="h-28 bg-indigo-soft/60 flex items-center justify-center">
                <span className="hail text-2xl text-indigo/40">{t}</span>
              </div>
              <div className="p-5">
                <div className="font-bold flex items-center justify-between">
                  {t}<span className="text-indigo text-sm opacity-0 group-hover:opacity-100">열기 →</span>
                </div>
                <p className="mt-1 text-xs text-muted">{d}</p>
                <code className="mt-2 inline-block text-[11px] text-muted">{href}</code>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* 매칭 방식 */}
      <Section kicker="MATCHING" title="매칭 방식, 3가지 안 비교">
        <div className="grid sm:grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <div key={p.name}
              className={`rounded-[18px] p-6 border ${p.best ? "border-indigo border-2 relative" : "border-line"}`}>
              {p.best && <span className="absolute -top-3 left-6 badge badge-confirmed">추천</span>}
              <div className="font-bold">{p.name}</div>
              <p className="mt-2 text-sm text-muted min-h-[60px]">{p.desc}</p>
              <div className="mt-4 border-t border-line pt-4 text-sm">
                <div className="flex justify-between"><span className="text-muted">공급가</span><b>{p.supply}원</b></div>
                <div className="flex justify-between mt-1"><span className="text-muted">VAT 포함</span><b className="text-indigo">{p.vat}원</b></div>
                <div className="flex justify-between mt-1"><span className="text-muted">기간</span><span>{p.weeks}</span></div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-muted">
          권장 <b className="text-indigo">2안</b> — 조건필터로 설명 가능한 매칭을 보장하면서, AI가 적합도 점수와 한 줄 사유를 얹어
          “2안 비용에 3안 체감”을 냅니다. 향후 3안(완전 자동매칭)으로 확장 가능한 구조입니다.
        </p>
      </Section>

      {/* 개발 범위 */}
      <Section kicker="SCOPE" title="개발 범위 (v1)">
        <div className="grid sm:grid-cols-2 gap-3">
          {SCOPE.map((s) => (
            <div key={s} className="flex items-start gap-3 rounded-xl border border-line p-4">
              <span className="mt-0.5 text-indigo font-bold">✓</span>
              <span className="text-sm">{s}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-muted">
          v2 확장 후보 · 화상면접 연동(Zoom/Whereby) · 결제/정산(PG) · 완전 자동매칭(3안) · 통계 고도화.
        </p>
      </Section>

      {/* 일정 */}
      <Section kicker="TIMELINE" title="4단계 진행 (2안 기준)">
        <div className="space-y-3">
          {[
            ["W1", "기반", "스키마·인증·디자인시스템·랜딩·기업목록"],
            ["W2", "핵심 흐름", "지원·기업검토·면접확정·마이페이지"],
            ["W3", "매칭·운영", "매칭엔진(필터+AI)·관리자 대시보드·알림 연동"],
            ["W4", "마감", "QA·시드데이터·배포·인수인계"],
          ].map(([w, t, d]) => (
            <div key={w} className="flex items-center gap-5 rounded-xl border border-line p-5">
              <span className="w-12 font-extrabold text-indigo">{w}</span>
              <div><div className="font-bold">{t}</div><div className="text-sm text-muted">{d}</div></div>
            </div>
          ))}
        </div>
      </Section>

      {/* 투자 */}
      <Section kicker="INVESTMENT" title="투자 안내">
        <div className="rounded-[18px] bg-indigo text-white p-8">
          <div className="text-sm opacity-80">권장 2안 · 조건필터 + AI 보조 매칭</div>
          <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
            <div>
              <div className="text-xs opacity-70">정가 (통상 외주가 4,870만원)</div>
              <div className="text-2xl font-bold line-through opacity-70">1,980만원</div>
            </div>
            <div>
              <div className="text-xs text-lime font-semibold">레퍼런스 1호 협약가 · 한정</div>
              <div className="flex items-end gap-2">
                <span className="hail text-5xl">300만원</span>
                <span className="opacity-80 mb-1">(VAT 별도 · 선금 50%)</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm opacity-90 max-w-2xl">
            정가는 1,980만 원이며, 아래 <b className="text-lime">레퍼런스 1호 협약</b> 조건에 한해 특별가로 진행합니다.
            화상면접·결제/정산은 v2 별도 산정, 운영 실비는 별도 협의입니다.
          </p>
        </div>

        {/* 협약 조건 */}
        <div className="mt-6">
          <div className="text-sm font-semibold text-indigo mb-3">레퍼런스 1호 협약가 적용 조건</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              ["공개 레퍼런스 권리", "실명·로고·사례를 포트폴리오(smartact.kr/works)에 게시 동의"],
              ["추천사 + 소개", "완료 후 실명 추천사 1건 및 소개 1건"],
              ["선금·빠른 결제", "계약 시 50% 선금, 납품 시 잔금"],
              ["범위 고정", "명시된 기능 한정. 추가 기능은 별도 견적"],
              ["직접 수정 자제", "운영 중 코드·DB 직접 수정은 별도 시간당 과금"],
            ].map(([t, d], i) => (
              <div key={t} className="flex items-start gap-3 rounded-xl border border-line p-4">
                <span className="mt-0.5 inline-flex w-6 h-6 rounded-md bg-indigo text-white items-center justify-center text-xs font-bold">{i + 1}</span>
                <div><div className="font-semibold text-sm">{t}</div><p className="text-xs text-muted mt-0.5">{d}</p></div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">
            ※ 본 협약가는 1호 도입처 한정 특별가입니다. 이후 동일 사양 표준 단가는 정가 기준으로 적용됩니다.
          </p>
        </div>
      </Section>

      {/* 제안사 */}
      <Section kicker="WHO WE ARE" title="제안사 — 스마택트">
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            ["실제로 만들어 옵니다", "제안 단계에서 이미 동작하는 데모를 보여드립니다. 말이 아니라 화면으로."],
            ["AI 활용 교육 전문", "교육 현장에서 검증한 AI 활용 역량을 제품에 그대로 녹입니다."],
            ["빠르고 합리적인 단가", "현대적 개발 방식으로 통상 외주 대비 빠른 납기와 합리적 비용을 제공합니다."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-[18px] border border-line p-6">
              <div className="font-bold">{t}</div><p className="mt-2 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-[18px] bg-indigo-soft/50 p-8 text-center">
          <div className="hail text-2xl">다음 기회를, 학생에게.</div>
          <p className="mt-2 text-sm text-muted">제안에 대한 논의를 환영합니다 · smartact.kr</p>
          <Link href="/" className="mt-5 inline-block rounded-full bg-indigo text-white px-7 py-3 font-semibold">라이브 데모 다시 보기</Link>
        </div>
      </Section>
    </div>
  );
}
