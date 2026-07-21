import Link from "next/link";
import { type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { getSessionProfile } from "@/lib/auth";
import { isSupabaseEnabled } from "@/lib/supabase/admin";

const NAV = [
  { href: "/admin", label: "대시보드", icon: "▦" },
  { href: "/admin/users", label: "회원 관리", icon: "👤" },
  { href: "/admin/companies/new", label: "기업 등록", icon: "🏢" },
  { href: "/admin/jobs", label: "공고 관리", icon: "📋" },
  { href: "/admin/jobs/new", label: "공고 등록", icon: "✍️" },
  { href: "/admin/matches", label: "매칭 현황", icon: "⚡" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
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
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink/70 hover:bg-indigo-soft hover:text-indigo transition-colors"
            >
              <span className="text-base leading-none">{n.icon}</span>
              {n.label}
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
      <main className="flex-1 overflow-auto bg-gray-50/30">{children}</main>
    </div>
  );
}
