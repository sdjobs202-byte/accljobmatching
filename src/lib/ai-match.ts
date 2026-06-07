import type { Job, StudentProfile } from "./types";
import { ruleScore, combine, fallbackReason } from "./matching";
import { createAdminClient } from "./supabase/admin";

/**
 * AI 보조 매칭 (Claude API).
 * PLAN.md 4절 원칙: 정렬의 바닥은 결정론적 규칙점수, AI는 가산 점수·한줄 사유만.
 * - ANTHROPIC_API_KEY 없으면 규칙 점수 + 폴백 사유로 동작.
 * - 결과는 match_scores 테이블에 캐시(upsert)해 재호출 비용을 줄인다.
 */

export interface AiMatch {
  ruleScore: number;
  aiScore?: number;
  finalScore: number;
  reason: string;
}

const MODEL = "claude-haiku-4-5-20251001"; // 매칭 점수용 경량·저비용 모델

/** Claude에게 적합도 점수(0~100)와 한 줄 사유를 받는다. 실패 시 null. */
async function callClaude(student: StudentProfile, job: Job): Promise<{ score: number; reason: string } | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const prompt = `너는 채용 매칭 평가자다. 학생 프로필과 채용공고의 적합도를 0~100 정수로 평가하고, 한국어 한 줄 사유를 써라.
반드시 JSON만 출력: {"score": <0-100>, "reason": "<한 줄>"}

[학생]
학과: ${student.dept}
지역: ${student.region}
보유역량: ${student.skills.join(", ")}
희망직무: ${student.desiredJobs.join(", ")}
소개: ${student.intro}

[공고]
제목: ${job.title}
직무: ${job.jobCategory}
지역: ${job.region}
요구역량: ${job.requiredSkills.join(", ")}
내용: ${job.description}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as { score: number; reason: string };
    const score = Math.max(0, Math.min(100, Math.round(parsed.score)));
    return { score, reason: parsed.reason };
  } catch {
    return null;
  }
}

/** 단일 매칭 점수 산출(AI 보조 포함). */
export async function scoreMatch(student: StudentProfile, job: Job): Promise<AiMatch> {
  const rule = ruleScore(student, job);
  const ai = await callClaude(student, job);
  return {
    ruleScore: rule,
    aiScore: ai?.score,
    finalScore: combine(rule, ai?.score),
    reason: ai?.reason ?? fallbackReason(student, job),
  };
}

/** 점수를 match_scores 캐시에 저장(서비스 롤). 실패해도 조용히 무시. */
export async function cacheMatchScore(jobId: string, studentId: string, m: AiMatch) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("match_scores").upsert({
    job_id: jobId,
    student_id: studentId,
    rule_score: m.ruleScore,
    ai_score: m.aiScore ?? null,
    final_score: m.finalScore,
    reason: m.reason,
    updated_at: new Date().toISOString(),
  });
}

/**
 * 한 공고의 지원자/후보 학생들을 적합도순으로 평가.
 * 비용 절감: 규칙점수 상위 topN 명만 AI 호출, 나머지는 규칙점수만.
 */
export async function rankCandidates(
  job: Job,
  students: StudentProfile[],
  topN = 10,
): Promise<Array<{ student: StudentProfile; match: AiMatch }>> {
  // 1) 규칙점수로 1차 정렬
  const byRule = students
    .map((s) => ({ s, rule: ruleScore(s, job) }))
    .sort((a, b) => b.rule - a.rule);

  // 2) 상위 topN만 AI 보조
  const results = await Promise.all(
    byRule.map(async ({ s, rule }, i) => {
      if (i < topN) {
        const m = await scoreMatch(s, job);
        void cacheMatchScore(job.id, s.userId, m);
        return { student: s, match: m };
      }
      return {
        student: s,
        match: { ruleScore: rule, finalScore: rule, reason: fallbackReason(s, job) } as AiMatch,
      };
    }),
  );

  return results.sort((a, b) => b.match.finalScore - a.match.finalScore);
}
