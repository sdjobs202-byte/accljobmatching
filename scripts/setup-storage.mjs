// 일회성 스크립트: 이력서 업로드용 Storage 버킷 생성.
// 실행: node scripts/setup-storage.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// .env.local 간단 파서
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("환경변수 누락: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

const { data, error } = await admin.storage.createBucket("resumes", {
  public: true,
  fileSizeLimit: "10MB",
  allowedMimeTypes: ["application/pdf"],
});

if (error) {
  if (error.message?.includes("already exists")) {
    console.log("✓ 'resumes' 버킷이 이미 존재합니다.");
  } else {
    console.error("버킷 생성 실패:", error.message);
    process.exit(1);
  }
} else {
  console.log("✓ 'resumes' 버킷 생성 완료:", data?.name);
}
