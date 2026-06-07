import { getAdminStats } from "@/lib/data";

export default async function AdminDashboard() {
  const stats = await getAdminStats();
  const kpi = [
    { label: "학생 회원", value: stats.students },
    { label: "채용 기업", value: stats.companies },
    { label: "열린 공고", value: stats.jobs },
    { label: "면접 확정", value: stats.funnel.interview_confirmed },
  ];
  const funnel = [
    ["지원 접수", stats.applications],
    ["서류 검토", stats.funnel.reviewing + stats.funnel.interview_confirmed + stats.funnel.hired],
    ["면접 확정", stats.funnel.interview_confirmed + stats.funnel.hired],
    ["최종 합격", stats.funnel.hired],
  ] as const;
  const max = Math.max(funnel[0][1], 1);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-2xl font-bold mb-8">관리자 대시보드</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {kpi.map((k) => (
          <div key={k.label} className="rounded-[18px] border border-line p-6">
            <div className="text-3xl font-extrabold text-indigo">{k.value}</div>
            <div className="text-sm text-muted mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <h2 className="font-bold mb-4">매칭 퍼널</h2>
      <div className="space-y-3">
        {funnel.map(([label, n]) => (
          <div key={label} className="flex items-center gap-4">
            <span className="w-24 text-sm text-muted">{label}</span>
            <div className="flex-1 h-7 rounded-full bg-indigo-soft overflow-hidden">
              <div className="h-full bg-indigo flex items-center justify-end pr-3 text-white text-xs font-semibold"
                style={{ width: `${Math.max((n / max) * 100, 8)}%` }}>{n}</div>
            </div>
          </div>
        ))}
      </div>
      {stats.applications === 0 && (
        <p className="mt-8 text-sm text-muted">아직 지원 데이터가 없습니다.</p>
      )}
    </div>
  );
}
