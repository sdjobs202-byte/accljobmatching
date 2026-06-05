import Link from "next/link";
import { type ReactNode } from "react";
import { Logo } from "@/components/Logo";

export default function BizLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo />
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/biz" className="hover:text-indigo">대시보드</Link>
              <Link href="/biz/jobs/new" className="hover:text-indigo">공고 등록</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">기업 계정 (데모)</span>
            <div className="w-8 h-8 rounded-full bg-indigo text-white flex items-center justify-center text-xs font-bold">
              기
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
