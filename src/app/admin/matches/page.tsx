import { STATUS_LABEL, type AppStatus } from "@/lib/types";
import { getAdminMatches } from "@/lib/data";

const STATUS_CLS: Record<AppStatus, string> = {
  submitted: "badge-submitted",
  reviewing: "badge-reviewing",
  interview_confirmed: "badge-confirmed",
  rejected: "badge-rejected",
  hired: "badge-confirmed",
};

export default async function AdminMatchesPage() {
  const matches = await getAdminMatches();
  const sorted = [...matches].sort((a, b) => b.finalScore - a.finalScore);
  const high = matches.filter((m) => m.finalScore >= 60).length;
  const avg = matches.length
    ? Math.round(matches.reduce((s, m) => s + m.finalScore, 0) / matches.length)
    : 0;

  const scoreCls = (n: number) =>
    n >= 80 ? "bg-lime text-ink" : n >= 60 ? "bg-indigo-soft text-indigo" : "bg-gray-100 text-muted";

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold">매칭 현황</h1>
          <p className="text-sm text-muted mt-0.5">
            적합도 60+ 매칭 {high}건 · 전체 평균 {avg}점
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-lime" /> 80+</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-indigo-soft border border-indigo/20" /> 60–79</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-gray-100" /> 60 미만</span>
        </div>
      </div>

      {/* 요약 KPI */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "전체 지원·매칭", value: matches.length },
          { label: "60+ 매칭", value: high },
          { label: "평균 적합도", value: avg },
        ].map((k) => (
          <div key={k.label} className="rounded-[18px] border border-line p-5 bg-white">
            <div className="text-3xl font-extrabold text-indigo">{k.value}</div>
            <div className="text-sm text-muted mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[18px] border border-line overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-muted text-xs border-b border-line">
            <tr>
              {["학생", "지원 공고", "기업", "적합도", "상태"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sorted.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">아직 매칭(지원) 데이터가 없습니다.</td></tr>
            )}
            {sorted.map((m) => (
              <tr key={m.applicationId} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-4 font-semibold">{m.studentName}</td>
                <td className="px-5 py-4">{m.jobTitle}</td>
                <td className="px-5 py-4 text-muted">{m.companyName}</td>
                <td className="px-5 py-4">
                  <span className={`badge ${scoreCls(m.finalScore)} font-bold`}>{m.finalScore}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`badge ${STATUS_CLS[m.status]}`}>{STATUS_LABEL[m.status]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
