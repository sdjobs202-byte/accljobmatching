// 라우트 전환 시 즉시 뜨는 기본 스켈레톤(스트리밍 폴백).
// 서버 렌더가 끝날 때까지 빈 화면 대신 골격을 보여줘 체감 지연을 줄인다.
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 animate-pulse">
      <div className="h-8 w-56 rounded-lg bg-line mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[18px] border border-line p-6">
            <div className="h-8 w-16 rounded bg-line mb-2" />
            <div className="h-3 w-20 rounded bg-line" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-[18px] border border-line" />
        ))}
      </div>
    </div>
  );
}
