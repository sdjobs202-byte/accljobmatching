import Link from "next/link";
import { type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { getSessionProfile } from "@/lib/auth";
import {
  isServiceRoleConfigured,
  isSupabaseEnabled,
  SERVICE_ROLE_MISSING_MSG,
} from "@/lib/supabase/admin";
import {
  IconBolt,
  IconBuilding,
  IconCheckCircle,
  IconClipboardList,
  IconDashboard,
  IconDocuments,
  IconPencil,
  IconUsers,
  IconXCircle,
} from "@/components/icons";

const NAV = [
  { href: "/admin", label: "대시보드", Icon: IconDashboard },
  { href: "/admin/users", label: "회원 관리", Icon: IconUsers },
  { href: "/admin/companies/new", label: "기업 등록", Icon: IconBuilding },
  { href: "/admin/jobs", label: "공고 관리", Icon: IconClipboardList },
  { href: "/admin/jobs/new", label: "공고 등록", Icon: IconPencil },
  { href: "/admin/matches", label: "매칭 현황", Icon: IconBolt },
  { href: "/admin/applications", label: "지원 현황", Icon: IconDocuments },
  { href: "/admin/applications?status=interview_confirmed", label: "면접 확정", Icon: IconCheckCircle },
  { href: "/admin/applications?status=rejected", label: "미선정", Icon: IconXCircle },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // 서비스 롤 키가 없으면 관리자 조회·쓰기가 전부 막힌다.
  // 예전엔 조용히 빈 목록으로만 보여 원인 파악이 어려웠으므로 배너로 명시한다.
  const serviceRoleMissing = isSupabaseEnabled() && !isServiceRoleConfigured();

  // 관리자 접근 가드 (Supabase 연동 시에만 적용)
  if (isSupabaseEnabled()) {
    const profile = await getSessionProfile();
    if (profile?.role !== "admin") {
      return (
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <h1 className="text-2xl font-bold mb-3">관리자 전용</h1>
          <p className="text-sm text-muted mb-6">
            이 영역은 관리자 계정으로만 접근할 수 있습니다.<br />관리자 계정으로 로그인해주세요.
          </p>
          <Link href="/login" className="rounded-full bg-indigo text-white px-6 py-3 font-semibold">
            로그인
          </Link>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* 사이드바 */}
      <aside className="w-52 border-r border-line flex flex-col py-8 px-4 shrink-0 bg-white">
        <Logo iconSize={24} />
        <p className="text-xs text-muted mb-8">관리자 콘솔</p>
        <nav className="space-y-1">
          {NAV.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink/70 hover:bg-indigo-soft hover:text-indigo transition-colors"
            >
              <Icon className="shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8 border-t border-line">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo text-white flex items-center justify-center text-xs font-bold">
              관
            </div>
            <span className="text-xs text-muted">관리자 (데모)</span>
          </div>
        </div>
      </aside>

      {/* 메인 */}
      <main className="flex-1 overflow-auto bg-gray-50/30">
        {serviceRoleMissing && (
          <div className="border-b border-rose-200 bg-rose-50 px-8 py-4">
            <p className="text-sm font-bold text-rose-800">관리자 데이터를 불러올 수 없습니다</p>
            <p className="mt-1 text-sm text-rose-700">{SERVICE_ROLE_MISSING_MSG}</p>
            <p className="mt-1 text-xs text-rose-600">
              Supabase → Settings → API → <code className="font-mono">service_role</code> 키를 복사해
              Vercel → Settings → Environment Variables 에{" "}
              <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> 로 추가하세요.
              아래 목록이 비어 있는 것은 실제 데이터가 없어서가 아닙니다.
            </p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
