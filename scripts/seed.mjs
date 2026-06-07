// 데모 시드 데이터 삽입 (견본 기업·공고). 운영 시작 시 삭제 가능.
// 실행: node scripts/seed.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// 0) 매칭 가중치 싱글톤 보장
await admin.from("match_weights").upsert({ id: 1 });

// 1) 기업
const companies = [
  { name: "한빛정밀", industry: "기계/정밀가공", region: "성남", intro: "CNC 정밀가공 30년 강소기업", perks: "기숙사·자격수당·정규전환" },
  { name: "코어로보틱스", industry: "로봇/자동화", region: "판교", intro: "협동로봇 SI 전문", perks: "스톡옵션·교육비" },
  { name: "그린에너지셀", industry: "이차전지", region: "성남", intro: "배터리 셀 품질 솔루션", perks: "4.5일제·중식제공" },
  { name: "스마트팩토리원", industry: "스마트팩토리", region: "용인", intro: "MES/설비 데이터 플랫폼", perks: "유연근무·장비지원" },
];
const { data: cos, error: coErr } = await admin.from("companies").insert(companies).select("id, name");
if (coErr) { console.error("기업 삽입 실패:", coErr.message); process.exit(1); }
const idByName = Object.fromEntries(cos.map((c) => [c.name, c.id]));
console.log("✓ 기업", cos.length, "개 삽입");

// 2) 공고
const jobs = [
  { company: "한빛정밀", title: "CNC 가공 엔지니어", job_category: "기계설계", employment_type: "fulltime", region: "성남", required_skills: ["CNC", "캐드", "측정"], description: "정밀부품 가공 및 품질측정" },
  { company: "코어로보틱스", title: "로봇 SI 어시스턴트", job_category: "자동화", employment_type: "intern", region: "판교", required_skills: ["PLC", "전기제어", "협동로봇"], description: "협동로봇 셋업·시운전 보조" },
  { company: "그린에너지셀", title: "배터리 품질 분석원", job_category: "품질관리", employment_type: "fulltime", region: "성남", required_skills: ["품질", "데이터분석", "엑셀"], description: "셀 공정 품질 데이터 분석" },
  { company: "스마트팩토리원", title: "MES 데이터 운영", job_category: "데이터", employment_type: "contract", region: "용인", required_skills: ["SQL", "데이터분석", "설비"], description: "설비 데이터 수집·대시보드 운영" },
].map(({ company, ...j }) => ({ ...j, company_id: idByName[company], status: "open" }));

const { error: jobErr, count } = await admin.from("jobs").insert(jobs, { count: "exact" });
if (jobErr) { console.error("공고 삽입 실패:", jobErr.message); process.exit(1); }
console.log("✓ 공고", count ?? jobs.length, "개 삽입");
console.log("시드 완료. 학생 계정으로 가입 후 /companies 에서 확인하세요.");
