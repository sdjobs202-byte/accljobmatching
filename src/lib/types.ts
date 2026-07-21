export type Role = "student" | "company" | "admin";
export type EmploymentType = "fulltime" | "intern" | "contract" | "parttime";
export type AppStatus = "submitted" | "reviewing" | "interview_confirmed" | "rejected" | "hired";

export const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  fulltime: "정규직",
  intern: "인턴",
  contract: "계약직",
  parttime: "파트타임",
};

export const STATUS_LABEL: Record<AppStatus, string> = {
  submitted: "지원 접수",
  reviewing: "서류 검토중",
  interview_confirmed: "면접 확정",
  rejected: "미선정",
  hired: "최종 합격",
};

export interface Company {
  id: string;
  name: string;
  industry: string;
  region: string;
  logoUrl?: string;
  intro: string;
  perks: string;
  hashtags?: string[];   // 기업소개 해시태그(키워드 매칭용)
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  jobCategory: string;
  employmentType: EmploymentType;
  region: string;
  requiredSkills: string[];
  description: string;
}

export interface StudentProfile {
  userId: string;
  name: string;
  dept: string;
  region: string;
  skills: string[];
  desiredJobs: string[];
  intro: string;
}

export interface MatchResult {
  ruleScore: number;
  aiScore?: number;
  finalScore: number;
  reason?: string;
}
