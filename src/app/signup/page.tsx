import Link from "next/link";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const isCompany = role === "company";
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="hail text-3xl mb-2">{isCompany ? "좋은 사람을, 만나러." : "시작해보자, 너의 커리어."}</h1>
      <p className="text-sm text-muted mb-6">{isCompany ? "기업 회원가입" : "학생 회원가입"}</p>

      <div className="flex gap-2 mb-6">
        <Link href="/signup?role=student"
          className={`flex-1 text-center rounded-full py-2 text-sm font-semibold border ${!isCompany ? "bg-indigo text-white border-indigo" : "border-line"}`}>학생</Link>
        <Link href="/signup?role=company"
          className={`flex-1 text-center rounded-full py-2 text-sm font-semibold border ${isCompany ? "bg-indigo text-white border-indigo" : "border-line"}`}>기업</Link>
      </div>

      <form className="space-y-3">
        <input placeholder={isCompany ? "회사명" : "이름"} className="w-full rounded-xl border border-line px-4 py-3" />
        <input type="email" placeholder="이메일" className="w-full rounded-xl border border-line px-4 py-3" />
        <input type="password" placeholder="비밀번호" className="w-full rounded-xl border border-line px-4 py-3" />
        <label className="flex items-start gap-2 text-xs text-muted">
          <input type="checkbox" className="mt-0.5" /> 개인정보 수집·이용에 동의합니다. (필수)
        </label>
        <button className="w-full rounded-xl bg-indigo text-white py-3 font-semibold">가입하고 프로필 작성</button>
      </form>
      <p className="mt-4 text-xs text-muted">* 가입 후 /onboarding 으로 이동해 {isCompany ? "회사정보" : "학과·역량"}을 1스텝으로 입력합니다.</p>
    </div>
  );
}
