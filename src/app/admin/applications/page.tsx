import Link from "next/link";
import { STATUS_LABEL, type AppStatus } from "@/lib/types";
import { getAdminMatches } from "@/lib/data";
import { isSupabaseEnabled } from "@/lib/supabase/admin";

const STATUS_CLS: Record<AppStatus, string> = {
  submitted: "badge-submitted",
  reviewing: "badge-reviewing",
  interview_confirmed: "badge-confirmed",
  rejected: "badge-rejected",
  hired: "badge-confirmed",
};

/** 탭 순서 = 전형 진행 순서. 사이드바의 "면접 확정"·"미선정"이 여기로 들어온다. */
const TABS: AppStatus[] = ["submitted", "reviewing", "interview_confirmed", "rejected", "hired"];

function isAppStatus(v: string | undefined): v is AppStatus {
  return !!v && (TABS as string[]).includes(v);
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = isAppStatus(status) ? status : null; // 그 외 값은 "전체"로 취급
  const all = await getAdminMatches();
  const rows = active ? all.filter((m) => m.status === active) : all;
  const countOf = (s: AppStatus) => all.filter((m) => m.status === s).length;
  const demo = !isSupabaseEnabled();

  return (
    <div className="px-8 py-10">
      <div className="mb-6">
        <h1 className="text-xl font-bold">
          지원 현황{active && ` — ${STATUS_LABEL[active]}`}
        </h1>
        <p className="text-sm text-muted mt-0.5">
          전체 {all.length}건 중 {rows.length}건 표시
          {demo && (
            <span className="ml-2 rounded-full bg-indigo-soft text-indigo text-xs font-semibold px-2 py-0.5">
              데모(더미) 데이터
            </span>
          )}
        </p>
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/admin/applications"
          className={`text-sm rounded-full px-4 py-2 font-semibold border transition-colors ${
            active === null
              ? "bg-indigo text-white border-indigo"
              : "border-line text-muted hover:border-indigo hover:text-indigo"
          }`}
        >
          전체 {all.length}
        </Link>
        {TABS.map((s) => (
          <Link
            key={s}
            href={`/admin/applications?status=${s}`}
            className={`text-sm rounded-full px-4 py-2 font-semibold border transition-colors ${
              active === s
                ? "bg-indigo text-white border-indigo"
                : "border-line text-muted hover:border-indigo hover:text-indigo"
            }`}
          >
            {STATUS_LABEL[s]} {countOf(s)}
          </Link>
        ))}
      </div>

      <div className="rounded-[18px] border border-line overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-muted text-xs border-b border-line">
            <tr>
              {["학생", "지원 공고", "기업", "지원일", "상태", "서류"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted">
                  {active ? `${STATUS_LABEL[active]} 상태인 지원이 없습니다.` : "아직 지원 데이터가 없습니다."}
                </td>
              </tr>
            )}
            {rows.map((m) => (
              <tr key={m.applicationId} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-4 font-semibold">{m.studentName}</td>
                <td className="px-5 py-4">{m.jobTitle}</td>
                <td className="px-5 py-4 text-muted">{m.companyName}</td>
                <td className="px-5 py-4 text-muted">{m.submittedAt}</td>
                <td className="px-5 py-4">
                  <span className={`badge ${STATUS_CLS[m.status]}`}>{STATUS_LABEL[m.status]}</span>
                </td>
                <td className="px-5 py-4">
                  {/* 데모 모드의 지원 건은 실제 상세 페이지가 없어 링크를 걸지 않는다. */}
                  {demo ? (
                    <span className="text-xs text-muted">—</span>
                  ) : (
                    <Link
                      href={`/biz/applicants/detail/${m.applicationId}`}
                      className="text-xs rounded-full border border-line px-3 py-1.5 text-muted hover:text-indigo hover:border-indigo transition-colors"
                    >
                      서류 보기
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3.5 border-t border-line bg-gray-50 text-xs text-muted">
          총 {rows.length}건
        </div>
      </div>
    </div>
  );
}
