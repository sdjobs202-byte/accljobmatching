import { getSessionProfile } from "@/lib/auth";
import { getMyStudentProfile, getMyCompany } from "@/lib/data";
import OnboardingForm from "./OnboardingForm";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/login");
  }

  // 관리자는 기본적으로 학생 폼으로 처리하거나 온보딩 단계 패스 가능 (여기선 student로 폴백)
  const role = profile.role === "admin" ? "student" : profile.role;

  let initialData = null;
  if (role === "student") {
    initialData = await getMyStudentProfile();
  } else if (role === "company") {
    initialData = await getMyCompany();
  }

  return (
    <OnboardingForm
      role={role}
      name={profile.name}
      phone={profile.phone}
      initialData={initialData}
    />
  );
}
