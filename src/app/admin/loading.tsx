// 관리자 콘솔 표 스켈레톤. 사이드바(layout)는 즉시 뜨고 본문만 골격 표시.
export default function AdminLoading() {
  return (
    <div className="px-8 py-10 animate-pulse">
      <div className="h-6 w-40 rounded bg-line mb-2" />
      <div className="h-4 w-56 rounded bg-line mb-8" />
      <div className="rounded-[18px] border border-line overflow-hidden bg-white">
        <div className="h-11 bg-gray-50 border-b border-line" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-line last:border-0">
            <div className="h-4 flex-1 rounded bg-line" />
            <div className="h-6 w-16 rounded-full bg-line" />
            <div className="h-6 w-16 rounded-full bg-line" />
            <div className="h-4 w-20 rounded bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
