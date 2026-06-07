import { redirect } from "next/navigation";

// 데모 앱이 첫 화면(/)으로 승격됨. 기존 /demo 링크는 홈으로 리다이렉트.
export default function DemoRedirect() {
  redirect("/");
}
