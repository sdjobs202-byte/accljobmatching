import Link from "next/link";

export default function DemoHome() {
  return (
    <div>
      {/* 데모 안내 배너 */}
      <div className="bg-indigo text-white text-sm">
        <div className="mx-auto max-w-6xl px-5 py-2.5 flex items-center justify-between gap-3">
          <span>이 화면은 실제로 동작하는 <b>라이브 데모</b>입니다 — 메뉴를 눌러 둘러보세요.</span>
          <Link href="/" className="shrink-0 underline underline-offset-2">← 제안서로 돌아가기</Link>
        </div>
      </div>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pt-20 pb-16">
        <p className="text-sm font-semibold text-indigo mb-4">대학생 × 채용기업</p>
        <h1 className="hail text-5xl sm:text-7xl max-w-3xl">
          다음 기회를,<br />
          <span className="bg-lime px-2">너에게.</span>
        </h1>
        <p className="mt-6 text-lg text-muted max-w-xl">
          조건에 맞는 기업을 정렬하고, 적합도와 한 줄 이유까지 — 지원부터 면접 확정까지 한 흐름으로 잇습니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/companies" className="rounded-full bg-indigo text-white px-6 py-3 font-semibold">
            채용공고 둘러보기
          </Link>
          <Link href="/signup?role=company" className="rounded-full border border-line px-6 py-3 font-semibold">
            기업으로 시작하기
          </Link>
        </div>
      </section>

      {/* 통계 */}
      <section className="border-y border-line bg-indigo-soft/40">
        <div className="mx-auto max-w-6xl px-5 py-10 grid grid-cols-3 gap-6 text-center">
          {[
            ["400+", "참여 학생"],
            ["50", "채용 기업"],
            ["8단계", "지원→매칭 흐름"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo">{n}</div>
              <div className="text-sm text-muted mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 역할 진입 */}
      <section className="mx-auto max-w-6xl px-5 py-16 grid sm:grid-cols-3 gap-5">
        {[
          { t: "학생", d: "프로필 등록하고 맞춤 공고를 추천받으세요.", href: "/signup?role=student", cta: "학생 가입" },
          { t: "기업", d: "공고를 올리고 적합한 지원자를 점수순으로.", href: "/signup?role=company", cta: "기업 가입" },
          { t: "운영자", d: "회원·지원·매칭 현황을 한눈에.", href: "/admin", cta: "관리자" },
        ].map((c) => (
          <Link key={c.t} href={c.href}
            className="rounded-[18px] border border-line p-7 hover:border-indigo transition-colors">
            <div className="text-xl font-bold">{c.t}</div>
            <p className="mt-2 text-sm text-muted">{c.d}</p>
            <span className="mt-6 inline-block text-sm font-semibold text-indigo">{c.cta} →</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
