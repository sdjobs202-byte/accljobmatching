import type { Role } from "@/lib/types";
import { getAdminUsers } from "@/lib/data";

const ROLE_LABEL: Record<Role, string> = { student: "학생", company: "기업", admin: "관리자" };
const ROLE_CLS: Record<Role, string> = {
  student: "badge-submitted",
  company: "bg-gray-100 text-ink",
  admin: "badge-confirmed",
};
const STATUS_LABEL: Record<string, string> = {
  active: "활성", pending: "승인 대기", suspended: "정지",
};
const STATUS_CLS: Record<string, string> = {
  active: "bg-lime text-ink",
  pending: "bg-amber-50 text-amber-700",
  suspended: "bg-gray-100 text-muted",
};

export default async function AdminUsersPage() {
  const users = await getAdminUsers();
  const students = users.filter((u) => u.role === "student");
  const companies = users.filter((u) => u.role === "company");
  const pending = users.filter((u) => u.status === "pending");

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold">회원 관리</h1>
          <p className="text-sm text-muted mt-0.5">
            학생 {students.length}명 · 기업 {companies.length}개사
            {pending.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5">
                승인 대기 {pending.length}건
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="rounded-[18px] border border-line overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-muted text-xs border-b border-line">
            <tr>
              {["이름", "역할", "상태", "가입일"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-muted">가입한 회원이 없습니다.</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-4 font-semibold">{u.name || "(이름 미설정)"}</td>
                <td className="px-5 py-4">
                  <span className={`badge ${ROLE_CLS[u.role]}`}>{ROLE_LABEL[u.role]}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`badge ${STATUS_CLS[u.status] ?? "bg-gray-100 text-muted"}`}>
                    {STATUS_LABEL[u.status] ?? u.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted">{u.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3.5 border-t border-line bg-gray-50 text-xs text-muted">
          총 {users.length}명
        </div>
      </div>
    </div>
  );
}
