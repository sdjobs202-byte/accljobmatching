import Link from "next/link";
import { Logo } from "./Logo";
import { getSessionProfile } from "@/lib/auth";
import { isSupabaseEnabled } from "@/lib/supabase/admin";
import { signOut } from "@/lib/actions";

export default async function Header() {
  // Supabase 미설정(로컬 데모)일 때는 모든 메뉴 노출, 설정 시 역할 기반 노출.
  // 로그인 상태는 두 모드 모두 getSessionProfile로 판별(목업 모드도 쿠키 세션 반영).
  const demo = !isSupabaseEnabled();
  const profile = await getSessionProfile();
  const role = profile?.role;
  const loggedIn = !!profile;

  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/companies" className="hover:text-indigo">채용공고</Link>

          {(demo || role === "student") && (
            <Link href="/me" className="hover:text-indigo">
              {profile?.name ? `${profile.name} 마이페이지` : "마이페이지"}
            </Link>
          )}
          {(demo || role === "company") && (
            <Link href="/biz" className="hover:text-indigo">기업</Link>
          )}
          {(demo || role === "admin") && (
            <Link href="/admin" className="hover:text-indigo">관리자</Link>
          )}

          {loggedIn ? (
            <>
              {profile?.name && <span className="text-xs text-muted">{profile.name}님</span>}
              <form action={signOut}>
                <button className="rounded-full border border-line px-4 py-2 text-sm hover:border-indigo hover:text-indigo transition-colors">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="rounded-full bg-indigo text-white px-4 py-2">로그인</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
