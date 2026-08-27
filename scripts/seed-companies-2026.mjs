// 2026 IT·AI 기업매칭 — 수요조사 참여 기업의 기업회원 계정 생성.
//
// 실행:
//   1) supabase/company_contacts.sql 을 Supabase SQL Editor 에서 먼저 실행
//   2) node scripts/seed-companies-2026.mjs
//
// 출처: "2026년 잡매치 기업 정보 등록 IT·AI기업매칭_기업 수요 조사(응답)_0827"
//
// 로그인 아이디 = 수요조사에 적어준 담당자 업무 이메일
// 비밀번호      = 그 이메일의 앞자리(로컬파트). 운영 요청사항이며, 초기 배포용이다.
//                 추측이 쉬우므로 첫 로그인 후 변경 안내를 함께 보내야 한다.
//
// 여러 번 돌려도 안전하다(이미 있으면 갱신). 실패한 기업은 건너뛰고 마지막에 요약을 찍는다.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("✗ .env.local 에 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.");
  process.exit(1);
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SOURCE = "2026-IT-AI";

/**
 * 수요조사 원본. 표를 그대로 옮긴 것이며 임의로 채운 값은 없다.
 * 표에 없는 항목(업종·지역·전화번호)은 비워 둔다 — 추정해서 넣지 않는다.
 */
const COMPANIES = [
  { name: "(주)엑스에이아이코리아", contactName: "김재환", contactTitle: "대표이사",
    email: "contact@xaikorea.ai.kr", fields: ["SW/앱개발", "AI/데이터/LLM"], hiringCount: 2, priority: 1, status: "확정" },
  { name: "(주)트리톤넷", contactName: "강성용", contactTitle: "대표",
    email: "ksybluest@gmail.com", fields: ["AI/데이터/LLM"], hiringCount: 2, priority: 1, status: "확정" },
  { name: "(주)커넥토", contactName: "김한나", contactTitle: "대표",
    email: "hannah@connecto-wyw.com", fields: ["SW/앱개발", "AI/데이터/LLM"], hiringCount: 2, priority: 1, status: "확정" },
  { name: "머플(주)", contactName: "문우석", contactTitle: "정부과제기획/팀장",
    email: "mus007@murple.ai", fields: ["SW/앱개발", "AI/데이터/LLM"], hiringCount: 2, priority: 1, status: "확정" },
  { name: "(주)김주하아기수면연구소", contactName: "김주하", contactTitle: "대표",
    email: "joohalab@naver.com", fields: ["AI/데이터/LLM"], hiringCount: 1, priority: 1, status: "확정" },
  // 수요인원 0 — 수요조사 시점 채용 계획 없음. 확정 기업이라 계정은 만들고 공고는 비워 둔다.
  { name: "보윙(주)", contactName: "오동길", contactTitle: "대표이사",
    email: "donggiloh@vowing.co.kr", fields: ["SW/앱개발"], hiringCount: 0, priority: 1, status: "확정" },
  { name: "한솔생명과학(주)", contactName: "최은숙", contactTitle: "인사팀 수석",
    email: "eschoi1@hansolbio.com", fields: ["AI/데이터/LLM", "디지털마케팅"], hiringCount: 5, priority: 1, status: "확정" },
  { name: "디알텍", contactName: "박지선", contactTitle: "부장",
    email: "jspark@drtech.com", fields: ["SW/앱개발"], hiringCount: 1, priority: 1, status: "확정" },
];

/** 비밀번호 = 이메일 앞자리. 관리자가 목록만 보고 알아볼 수 있게 한다(운영 요청). */
const passwordOf = (email) => email.split("@")[0];

/**
 * 공개 소개문. companies 는 비로그인 방문자에게도 전 컬럼이 열리므로
 * 담당자 실명·이메일·수요인원 같은 내부 정보는 넣지 않는다.
 */
const introOf = (c) => "2026 IT·AI 기업매칭 참여 기업. " + c.fields.join(", ") + " 분야 채용을 검토 중입니다.";

/** 이미 가입된 이메일이면 그 계정을 재사용하고, 없으면 새로 만든다. */
async function getOrCreateUser(email, name) {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) throw new Error("계정 목록 조회 실패: " + listErr.message);

  const found = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (found) {
    // 재실행 시 비밀번호·역할을 요청안대로 다시 맞춘다(복구 용도).
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
    email_confirm: true, // 관리자가 만든 계정이라 인증 메일 없이 바로 로그인 가능하게
    user_metadata: { role: "company", name },
  });
  if (error) throw new Error("계정 생성 실패: " + error.message);
  return { id: data.user.id, created: true };
}

/**
 * hashtags 컬럼 존재 여부(= add_keywords.sql 실행 여부).
 * 없는 DB에서도 계정·기업 생성은 되게 하고, 매칭 키워드만 건너뛴다.
 */
const hasHashtags = await (async () => {
  const { error } = await admin.from("companies").select("hashtags").limit(1);
  if (!error) return true;
  console.warn("! companies.hashtags 컬럼이 없어 희망분야 키워드는 저장하지 않습니다.");
  console.warn("  매칭에 쓰려면 supabase/add_keywords.sql 실행 후 이 스크립트를 다시 돌려주세요.\n");
  return false;
})();

const results = [];

for (const c of COMPANIES) {
  try {
    // profiles 는 RLS 로 본인·관리자만 읽는다. 관리자 회원목록에서 바로 알아보도록
    // "회사명 담당자명" 형태로 넣는다.
    const profileName = c.name + " " + c.contactName;

    const { id: ownerId, created } = await getOrCreateUser(c.email, profileName);

    // 가입 트리거(handle_new_user)가 profiles 를 만들지만, 기존 계정이거나
    // 트리거가 빠진 환경일 수 있으므로 여기서 확정한다.
    const { error: pErr } = await admin
      .from("profiles")
      .upsert({ id: ownerId, role: "company", name: profileName, status: "active" });
    if (pErr) throw new Error("프로필 저장 실패: " + pErr.message);

    // 같은 이름의 회사가 이미 있으면 그 행을 갱신한다(중복 생성 방지).
    const { data: existing, error: findErr } = await admin
      .from("companies").select("id").eq("name", c.name).maybeSingle();
    if (findErr) throw new Error("기업 조회 실패: " + findErr.message);

    const companyRow = {
      owner_id: ownerId,
      name: c.name,
      // industry·region 은 수요조사 표에 없다 → 추정하지 않고 비워 둔다.
      intro: introOf(c),
      status: "active",
    };
    // hashtags 는 add_keywords.sql 을 실행한 DB에만 있다. 없는 환경에서도 나머지는 저장되게 한다.
    if (hasHashtags) companyRow.hashtags = c.fields;

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

    // 담당자·수요조사 정보 (관리자 전용 테이블)
    const { error: cErr } = await admin.from("company_contacts").upsert({
      company_id: companyId,
      contact_name: c.contactName,
      contact_title: c.contactTitle,
      contact_email: c.email,
      survey_fields: c.fields,
      hiring_count: c.hiringCount,
      priority: c.priority,
      contact_status: c.status,
      source: SOURCE,
      updated_at: new Date().toISOString(),
    });
    if (cErr) {
      throw new Error(
        /company_contacts|does not exist|schema cache/i.test(cErr.message)
          ? "company_contacts 테이블이 없습니다. supabase/company_contacts.sql 을 먼저 실행해주세요. (" + cErr.message + ")"
          : "담당자 정보 저장 실패: " + cErr.message,
      );
    }

    results.push({ ok: true, name: c.name, email: c.email, created });
  } catch (e) {
    results.push({ ok: false, name: c.name, email: c.email, reason: e.message });
  }
}

// ── 결과 요약 ────────────────────────────────────────
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

console.log("\n※ 비밀번호가 이메일 앞자리라 추측이 쉽습니다. 안내 시 첫 로그인 후 변경을 함께 요청해주세요.");
