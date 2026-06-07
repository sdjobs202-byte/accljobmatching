// 데모 계정·지원 데이터 생성 (biz·admin 화면 확인용).
// 실행: node scripts/seed-demo.mjs
// 운영 시작 시 삭제 가능. 모든 데모 계정 비밀번호: demo1234
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const PW = "demo1234";

// 이미 있으면 찾아서 재사용, 없으면 생성
async function getOrCreateUser(email, role, name) {
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const found = list.users.find((u) => u.email === email);
  if (found) return found.id;
  const { data, error } = await admin.auth.admin.createUser({
    email, password: PW, email_confirm: true, user_metadata: { role, name },
  });
  if (error) throw new Error(`${email}: ${error.message}`);
  return data.user.id;
}

// ── 1) 기업 오너 계정 → 한빛정밀에 연결 ──────────────
const ownerId = await getOrCreateUser("hanbit@demo.accl.kr", "company", "한빛정밀 채용담당");
await admin.from("profiles").update({ name: "한빛정밀 채용담당", phone: "010-1111-2222" }).eq("id", ownerId);

const { data: cos } = await admin.from("companies").select("id, name");
const coId = (n) => cos.find((c) => c.name === n)?.id;
await admin.from("companies").update({ owner_id: ownerId }).eq("id", coId("한빛정밀"));
console.log("✓ 기업 오너 계정 → 한빛정밀 연결 (hanbit@demo.accl.kr / demo1234)");

// ── 2) 학생 계정 + 프로필 ────────────────────────────
const students = [
  { email: "doyun@demo.accl.kr",  name: "김도윤", dept: "스마트기계과", region: "성남", skills: ["CNC","캐드","측정","품질"], desired: ["기계설계","품질관리"], intro: "정밀가공·품질에 강한 졸업예정자" },
  { email: "seoyeon@demo.accl.kr",name: "이서연", dept: "전기과",       region: "판교", skills: ["PLC","전기제어","협동로봇"], desired: ["자동화"], intro: "전기제어 실습 다수, 협동로봇 수료" },
  { email: "jihun@demo.accl.kr",  name: "박지훈", dept: "스마트SW과",   region: "용인", skills: ["SQL","데이터분석","엑셀","설비"], desired: ["데이터","품질관리"], intro: "데이터 분석 프로젝트 경험" },
  { email: "sumin@demo.accl.kr",  name: "최수민", dept: "기계과",       region: "성남", skills: ["CNC","캐드","용접"], desired: ["기계설계"], intro: "가공·용접 자격 보유" },
  { email: "haneul@demo.accl.kr", name: "정하늘", dept: "화공과",       region: "성남", skills: ["품질","데이터분석","엑셀"], desired: ["품질관리"], intro: "품질 데이터 분석 관심" },
  { email: "jiwoo@demo.accl.kr",  name: "한지우", dept: "자동화과",     region: "판교", skills: ["PLC","협동로봇","전기제어"], desired: ["자동화"], intro: "자동화 설비 셋업 경험" },
];
const sid = {};
for (const s of students) {
  const id = await getOrCreateUser(s.email, "student", s.name);
  sid[s.name] = id;
  await admin.from("profiles").update({ name: s.name }).eq("id", id);
  await admin.from("student_profiles").upsert({
    user_id: id, dept: s.dept, grad_year: 2026, region: s.region,
    skills: s.skills, desired_jobs: s.desired, intro: s.intro, updated_at: new Date().toISOString(),
  });
}
console.log(`✓ 학생 ${students.length}명 + 프로필`);

// ── 3) 지원 기록 (다양한 상태) ───────────────────────
const { data: jobs } = await admin.from("jobs").select("id, title");
const jid = (t) => jobs.find((j) => j.title.includes(t))?.id;
const apps = [
  ["김도윤", "CNC", "interview_confirmed", "CNC 가공 실습 300시간 이상 이수했습니다. 정밀가공에 강점이 있습니다."],
  ["김도윤", "배터리", "reviewing", "품질 데이터 분석에도 관심이 있어 지원합니다."],
  ["최수민", "CNC", "submitted", "가공·용접 자격을 바탕으로 빠르게 적응하겠습니다."],
  ["이서연", "로봇", "interview_confirmed", "협동로봇 SI에 깊은 관심이 있습니다."],
  ["한지우", "로봇", "submitted", "자동화 설비 셋업 경험을 살리고 싶습니다."],
  ["박지훈", "MES", "reviewing", "설비 데이터 수집·대시보드 구축 경험이 있습니다."],
  ["박지훈", "배터리", "submitted", "데이터 기반 품질 개선에 기여하겠습니다."],
  ["정하늘", "배터리", "reviewing", "품질 데이터 분석 역량을 발휘하겠습니다."],
];
let n = 0;
for (const [name, jobKey, status, cover] of apps) {
  const { error } = await admin.from("applications").upsert({
    job_id: jid(jobKey), student_id: sid[name], cover_letter: cover, status,
    interview_at: status === "interview_confirmed" ? new Date(Date.now() + 7 * 864e5).toISOString() : null,
  }, { onConflict: "job_id,student_id" });
  if (!error) n++;
  else console.error(`  지원 실패 ${name}→${jobKey}: ${error.message}`);
}
console.log(`✓ 지원 기록 ${n}건`);
console.log("\n데모 데이터 완료. 로그인 계정 예시:");
console.log("  • 기업: hanbit@demo.accl.kr / demo1234  (→ /biz 에서 지원자 확인)");
console.log("  • 학생: doyun@demo.accl.kr  / demo1234  (→ /me 에서 지원현황 확인)");
