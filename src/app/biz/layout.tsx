import Link from "next/link";
import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getSessionProfile } from "@/lib/auth";
import { isSupabaseEnabled } from "@/lib/supabase/admin";

export default async function BizLayout({ children }: { children: ReactNode }) {
  // 기업/관리자 로그인 필수 (Supabase 연동 시)
  let name = "기업 계정 (데모)";
  if (isSupabaseEnabled()) {
    const profile = await getSessionProfile();
    if (!profile || (profile.role !== "company" && profile.role !== "admin")) {
      redirect("/login");
    }
    name = profile.name || "기업 계정";
  }

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
            <span className="text-xs text-muted">{name}</span>
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
