// 채용공고/기업 목록 카드 스켈레톤.
export default function CompaniesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 animate-pulse">
      <div className="h-8 w-64 rounded-lg bg-line mb-2" />
      <div className="h-4 w-48 rounded bg-line mb-8" />
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-line" />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-[18px] border border-line p-5">
            <div className="h-5 w-40 rounded bg-line mb-3" />
            <div className="h-3 w-24 rounded bg-line mb-4" />
            <div className="flex gap-1.5">
              <div className="h-6 w-14 rounded-full bg-line" />
              <div className="h-6 w-14 rounded-full bg-line" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
