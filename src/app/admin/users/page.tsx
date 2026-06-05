import type { Role } from "@/lib/types";

type UserStatus = "active" | "pending" | "suspended";

type UserRow = {
  id: string;
  name: string;
  role: Role;
  email: string;
  status: UserStatus;
  joinedAt: string;
  dept?: string;
  company?: string;
};

const USERS: UserRow[] = [
  { id: "u1", name: "김도윤",          role: "student", email: "kim@poly.ac.kr",          status: "active",   joinedAt: "2026-05-28", dept: "스마트기계과" },
  { id: "u2", name: "이서연",          role: "student", email: "lee@poly.ac.kr",          status: "active",   joinedAt: "2026-05-29", dept: "전기과" },
  { id: "u3", name: "박지훈",          role: "student", email: "park@poly.ac.kr",         status: "pending",  joinedAt: "2026-06-01", dept: "스마트SW과" },
  { id: "u4", name: "최수민",          role: "student", email: "choi@poly.ac.kr",         status: "active",   joinedAt: "2026-06-02", dept: "메카트로닉스과" },
  { id: "u5", name: "정민준",          role: "student", email: "jung@poly.ac.kr",         status: "active",   joinedAt: "2026-06-03", dept: "스마트기계과" },
  { id: "u6", name: "오하늘",          role: "student", email: "oh@poly.ac.kr",           status: "active",   joinedAt: "2026-06-04", dept: "화학장치과" },
  { id: "c1", name: "한빛정밀 HR",     role: "company", email: "hr@hanbit.co.kr",         status: "active",   joinedAt: "2026-05-20", company: "한빛정밀" },
  { id: "c2", name: "코어로보틱스",    role: "company", email: "recruit@corerobotics.kr",  status: "active",   joinedAt: "2026-05-22", company: "코어로보틱스" },
  { id: "c3", name: "그린에너지셀",    role: "company", email: "hr@greenenergy.co.kr",    status: "pending",  joinedAt: "2026-06-04", company: "그린에너지셀" },
  { id: "c4", name: "스마트팩토리원",  role: "company", email: "hr@smartfactory1.co.kr",  status: "active",   joinedAt: "2026-05-30", company: "스마트팩토리원" },
];

const ROLE_LABEL: Record<Role, string> = { student: "학생", company: "기업", admin: "관리자" };
const ROLE_CLS: Record<Role, string> = {
  student: "badge-submitted",
  company: "bg-gray-100 text-ink",
  admin: "badge-confirmed",
};
const STATUS_LABEL: Record<UserStatus, string> = {
  active: "활성", pending: "승인 대기", suspended: "정지",
};
const STATUS_CLS: Record<UserStatus, string> = {
  active: "bg-lime text-ink",
  pending: "bg-amber-50 text-amber-700",
  suspended: "bg-gray-100 text-muted",
};

export default function AdminUsersPage() {
  const students = USERS.filter((u) => u.role === "student");
  const companies = USERS.filter((u) => u.role === "company");
  const pending = USERS.filter((u) => u.status === "pending");

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
        <div className="flex gap-2">
          <input
            placeholder="이름·이메일 검색"
            className="rounded-full border border-line px-4 py-2 text-sm focus:outline-none focus:border-indigo"
          />
          <select className="rounded-full border border-line px-4 py-2 text-sm focus:outline-none focus:border-indigo">
            <option value="">전체 역할</option>
            <option value="student">학생</option>
            <option value="company">기업</option>
          </select>
          <select className="rounded-full border border-line px-4 py-2 text-sm focus:outline-none focus:border-indigo">
            <option value="">전체 상태</option>
            <option value="active">활성</option>
            <option value="pending">대기</option>
          </select>
        </div>
      </div>

      <div className="rounded-[18px] border border-line overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-muted text-xs border-b border-line">
            <tr>
              {["이름", "역할", "이메일", "소속", "상태", "가입일", "관리"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {USERS.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-4 font-semibold">{u.name}</td>
                <td className="px-5 py-4">
                  <span className={`badge ${ROLE_CLS[u.role]}`}>{ROLE_LABEL[u.role]}</span>
                </td>
                <td className="px-5 py-4 text-muted">{u.email}</td>
                <td className="px-5 py-4 text-muted">{u.dept ?? u.company ?? "—"}</td>
                <td className="px-5 py-4">
                  <span className={`badge ${STATUS_CLS[u.status]}`}>{STATUS_LABEL[u.status]}</span>
                </td>
                <td className="px-5 py-4 text-muted">{u.joinedAt}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    {u.status === "pending" && (
                      <button className="text-xs rounded-full bg-indigo text-white px-3 py-1.5 font-semibold hover:bg-indigo/90">
                        승인
                      </button>
                    )}
                    <button className="text-xs rounded-full border border-line px-3 py-1.5 text-muted hover:text-indigo hover:border-indigo transition-colors">
                      상세
                    </button>
                    {u.status === "active" && (
                      <button className="text-xs rounded-full border border-line px-3 py-1.5 text-muted hover:text-red-500 hover:border-red-300 transition-colors">
                        정지
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3.5 border-t border-line bg-gray-50 flex items-center justify-between text-xs text-muted">
          <span>총 {USERS.length}명</span>
          <span>페이지 1 / 1 (Supabase 연동 시 페이지네이션 추가)</span>
        </div>
      </div>
    </div>
  );
}
