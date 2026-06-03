import type { Job, StudentProfile, MatchResult } from "./types";

/**
 * 2안(조건필터) + AI 보조 매칭.
 * 코어는 결정론적 규칙 점수(항상 일관·설명가능),
 * AI는 상위 후보에만 가산 설명을 붙이는 보조 레이어.
 */
export interface MatchWeights {
  wJob: number;       // 직무 일치
  wSkills: number;    // 역량 태그 겹침
  wRegion: number;    // 지역
  wEmployment: number;// 고용형태(희망 직무 내 매칭 가점)
}

export const DEFAULT_WEIGHTS: MatchWeights = {
  wJob: 40, wSkills: 30, wRegion: 15, wEmployment: 15,
};

/** 규칙 기반 점수 0~100 (결정론적) */
export function ruleScore(student: StudentProfile, job: Job, w = DEFAULT_WEIGHTS): number {
  let s = 0;
  // 직무 일치
  if (student.desiredJobs.includes(job.jobCategory)) s += w.wJob;
  // 역량 태그 겹침 비율
  const overlap = job.requiredSkills.filter((k) => student.skills.includes(k)).length;
  if (job.requiredSkills.length > 0) {
    s += Math.round((overlap / job.requiredSkills.length) * w.wSkills);
  }
  // 지역
  if (student.region && job.region && student.region === job.region) s += w.wRegion;
  // 희망 직무군이 하나라도 걸리면 고용형태 가점
  if (student.desiredJobs.length > 0) s += w.wEmployment;
  return Math.min(100, s);
}

/** 규칙 + AI 평균. aiScore 없으면 규칙점수 그대로. */
export function combine(rule: number, ai?: number): number {
  if (ai == null) return rule;
  return Math.round((rule + ai) * 0.5);
}

/**
 * AI 보조 점수. 실제로는 Claude API를 호출(서버 액션/엣지펑션)하지만,
 * 키가 없을 때를 위한 규칙 기반 폴백 사유 생성 포함.
 */
export function fallbackReason(student: StudentProfile, job: Job): string {
  const hits = job.requiredSkills.filter((k) => student.skills.includes(k));
  if (hits.length) return `보유 역량 ${hits.slice(0, 3).join("·")} 이(가) 공고 요구와 직접 맞물립니다.`;
  if (student.desiredJobs.includes(job.jobCategory)) return `희망 직무(${job.jobCategory}) 방향과 일치합니다.`;
  return "기본 조건은 충족하나 핵심 역량 보완 시 적합도가 올라갑니다.";
}

export function matchOne(student: StudentProfile, job: Job, ai?: number, reason?: string): MatchResult {
  const rule = ruleScore(student, job);
  return {
    ruleScore: rule,
    aiScore: ai,
    finalScore: combine(rule, ai),
    reason: reason ?? fallbackReason(student, job),
  };
}

/** 공고 목록을 학생 기준 적합도 내림차순 정렬 */
export function rankJobs(student: StudentProfile, jobs: Job[]): Array<Job & { match: MatchResult }> {
  return jobs
    .map((job) => ({ ...job, match: matchOne(student, job) }))
    .sort((a, b) => b.match.finalScore - a.match.finalScore);
}
