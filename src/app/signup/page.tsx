import Link from "next/link";
import SignupForm from "./SignupForm";

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

      <SignupForm isCompany={isCompany} />
      <p className="mt-4 text-xs text-muted">* 가입 후 /onboarding 으로 이동해 {isCompany ? "회사정보" : "학과·역량"}을 1스텝으로 입력합니다.</p>
    </div>
  );
}
