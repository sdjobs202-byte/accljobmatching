import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import "./globals.css";

export const metadata: Metadata = {
  title: "잡매칭 — 다음 기회를 찾아보세요",
  description: "대학생과 채용기업을 잇는 잡매칭 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
            <Logo />
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/companies" className="hover:text-indigo">채용공고</Link>
              <Link href="/me" className="hover:text-indigo">마이페이지</Link>
              <span className="h-4 w-px bg-line" />
              <Link href="/biz" className="text-muted hover:text-indigo text-xs">기업 데모</Link>
              <Link href="/admin" className="text-muted hover:text-indigo text-xs">관리자 데모</Link>
              <Link href="/login" className="rounded-full bg-indigo text-white px-4 py-2">로그인</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line py-10 text-xs text-muted">
          <div className="mx-auto max-w-6xl px-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-ink">(ACCL) AI 커리어콘텐츠 연구소</p>
              <p className="mt-1">대학생과 채용기업을 잇는 잡매칭 플랫폼</p>
              <p className="mt-1">문의: <a href="mailto:sdjobs202@gmail.com" className="hover:text-indigo">sdjobs202@gmail.com</a></p>
              <p className="mt-2">© 2026 (ACCL) AI 커리어콘텐츠 연구소 — 다음 기회를, 너에게.</p>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-indigo">이용약관</Link>
              <span className="h-3 w-px bg-line" />
              <Link href="/privacy" className="font-semibold hover:text-indigo">개인정보처리방침</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
