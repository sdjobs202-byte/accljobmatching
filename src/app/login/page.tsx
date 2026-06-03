import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="hail text-3xl mb-2">돌아온 걸 환영해.</h1>
      <p className="text-sm text-muted mb-8">잡매칭 로그인</p>
      <form className="space-y-3">
        <input type="email" placeholder="이메일" className="w-full rounded-xl border border-line px-4 py-3" />
        <input type="password" placeholder="비밀번호" className="w-full rounded-xl border border-line px-4 py-3" />
        <button className="w-full rounded-xl bg-indigo text-white py-3 font-semibold">로그인</button>
      </form>
      <p className="mt-6 text-sm text-muted text-center">
        처음이신가요? <Link href="/signup" className="text-indigo font-semibold">가입하기</Link>
      </p>
      <p className="mt-3 text-xs text-muted text-center">* Supabase Auth 연동 자리 (이메일·카카오 OAuth)</p>
    </div>
  );
}
