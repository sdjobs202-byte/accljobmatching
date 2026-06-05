import Link from "next/link";
import { type ReactNode } from "react";

const NAV = [
  { href: "/admin", label: "대시보드", icon: "▦" },
  { href: "/admin/users", label: "회원 관리", icon: "👤" },
  { href: "/admin/jobs", label: "공고 관리", icon: "📋" },
  { href: "/admin/matches", label: "매칭 현황", icon: "⚡" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* 사이드바 */}
      <aside className="w-52 border-r border-line flex flex-col py-8 px-4 shrink-0 bg-white">
        <Link href="/" className="font-extrabold text-base tracking-tight mb-1 inline-block">
          <span className="text-indigo">잡매칭</span>
          <span className="ml-1 inline-block w-2 h-2 rounded-full bg-lime align-middle" />
        </Link>
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
