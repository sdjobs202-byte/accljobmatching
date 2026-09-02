// 2026 IT·AI 기업매칭 — 추가 기업 4곳 계정 생성 (0831 배치 이후 추가분).
// 이번 표에는 담당자 직함·희망분야가 없다 — 추정해서 넣지 않는다.
//
// 실행 (셋 중 아무거나):
//   node scripts/seed-companies-2026-0902.mjs
//   node scripts/seed-companies-2026-0902.mjs --url=... --key=...
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-companies-2026-0902.mjs
//
// 로그인 아이디 = 담당자 업무 이메일
// 비밀번호      = 그 이메일의 앞자리(로컬파트). seed-companies-2026.mjs 와 동일한 운영 규칙.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function readEnvFile(path) {
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return {};
  }
  return Object.fromEntries(
    raw
      .split("\n")
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        const value = l.slice(i + 1).trim().replace(/^["']|["']$/g, "");
        return [l.slice(0, i).trim(), value];
      })
      .filter(([, v]) => v !== ""),
  );
}

function readArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const m = /^--(url|key)(?:=(.*))?$/.exec(argv[i]);
    if (!m) continue;
    out[m[1]] = m[2] !== undefined ? m[2] : argv[++i];
  }
  return out;
}

const args = readArgs(process.argv.slice(2));
const fileEnv = { ...readEnvFile(".env"), ...readEnvFile(".env.local") };
const pick = (key) => process.env[key] || fileEnv[key] || "";

const SUPABASE_URL = args.url || pick("NEXT_PUBLIC_SUPABASE_URL") || pick("SUPABASE_URL");
const SERVICE_KEY = args.key || pick("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("✗ Supabase 접속 정보가 없습니다. .env.local 에 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 를 넣어주세요.");
  process.exit(1);
}

if (!/^https?:\/\/.+/.test(SUPABASE_URL)) {
  console.error("✗ URL 형식이 아닙니다: " + SUPABASE_URL);
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SOURCE = "2026-IT-AI";

/** 표에 없는 항목(직함·희망분야·업종·지역·전화번호)은 비워 둔다 — 추정해서 넣지 않는다. */
const COMPANIES = [
  { name: "(주)마음에이아이", contactName: "유지호", email: "jihojoeyu@maum.ai" },
  { name: "(주)자스텍엠", contactName: "전혜진", email: "wjswls453@jastecm.com" },
  { name: "(주)쿠오핀", contactName: "이상훈", email: "shlee@quopin.com" },
  { name: "(주)루브릿지", contactName: "홍연욱", email: "future2u@naver.com" },
];

const passwordOf = (email) => email.split("@")[0];

async function getOrCreateUser(email, name) {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) throw new Error("계정 목록 조회 실패: " + listErr.message);

  const found = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (found) {
    const { error } = await admin.auth.admin.updateUserById(found.id, {
      password: passwordOf(email),
      user_metadata: { role: "company", name },
    });
    if (error) throw new Error("계정 갱신 실패: " + error.message);
    return { id: found.id, created: false };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: passwordOf(email),
    email_confirm: true,
    user_metadata: { role: "company", name },
  });
  if (error) throw new Error("계정 생성 실패: " + error.message);
  return { id: data.user.id, created: true };
}

{
  const { error } = await admin.from("companies").select("id").limit(1);
  if (error) {
    if (/JWT|api key|Invalid|Unauthorized/i.test(error.message)) {
      console.error("✗ Supabase 인증 실패: " + error.message);
    } else if (/does not exist|schema cache|relation/i.test(error.message)) {
      console.error("✗ companies 테이블이 없습니다: " + error.message);
    } else {
      console.error("✗ Supabase 접속 실패: " + error.message);
    }
    process.exit(1);
  }
}

const hasContacts = await (async () => {
  const { error } = await admin.from("company_contacts").select("company_id").limit(1);
  if (!error) return true;
  console.warn("! company_contacts 테이블이 없어 담당자 정보는 저장하지 않습니다.\n");
  return false;
})();

const results = [];

for (const c of COMPANIES) {
  try {
    const profileName = c.name + " " + c.contactName;

    const { id: ownerId, created } = await getOrCreateUser(c.email, profileName);

    const { error: pErr } = await admin
      .from("profiles")
      .upsert({ id: ownerId, role: "company", name: profileName, status: "active" });
    if (pErr) throw new Error("프로필 저장 실패: " + pErr.message);

    const { data: existing, error: findErr } = await admin
      .from("companies").select("id").eq("name", c.name).maybeSingle();
    if (findErr) throw new Error("기업 조회 실패: " + findErr.message);

    const companyRow = {
      owner_id: ownerId,
      name: c.name,
      status: "active",
    };

    let companyId;
    if (existing) {
      const { error } = await admin.from("companies").update(companyRow).eq("id", existing.id);
      if (error) throw new Error("기업 갱신 실패: " + error.message);
      companyId = existing.id;
    } else {
      const { data, error } = await admin.from("companies").insert(companyRow).select("id").single();
      if (error) throw new Error("기업 생성 실패: " + error.message);
      companyId = data.id;
    }

    if (hasContacts) {
      const { error: cErr } = await admin.from("company_contacts").upsert({
        company_id: companyId,
        contact_name: c.contactName,
        contact_email: c.email,
        source: SOURCE,
        updated_at: new Date().toISOString(),
      });
      if (cErr) throw new Error("담당자 정보 저장 실패: " + cErr.message);
    }

    results.push({ ok: true, name: c.name, email: c.email, created });
  } catch (e) {
    results.push({ ok: false, name: c.name, email: c.email, reason: e.message });
  }
}

const ok = results.filter((r) => r.ok);
const failed = results.filter((r) => !r.ok);

console.log("\n기업회원 계정 " + ok.length + "/" + results.length + "건 처리 완료\n");
console.log("기업명".padEnd(24) + "로그인 아이디".padEnd(30) + "비밀번호");
console.log("-".repeat(76));
for (const r of ok) {
  console.log(
    r.name.padEnd(24) + r.email.padEnd(30) + passwordOf(r.email) + (r.created ? "" : "   (기존 계정 갱신)"),
  );
}

if (failed.length) {
  console.log("\n실패 " + failed.length + "건:");
  for (const r of failed) console.log("  ✗ " + r.name + " (" + r.email + ") — " + r.reason);
  process.exitCode = 1;
}

if (!hasContacts) {
  console.log("\n※ 담당자 정보는 저장하지 않았습니다(company_contacts 테이블 없음).");
}

console.log("\n※ 비밀번호가 이메일 앞자리라 추측이 쉽습니다. 안내 시 첫 로그인 후 변경을 함께 요청해주세요.");
