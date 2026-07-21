import type { Company, Job, StudentProfile } from "./types";

// Supabase 연결 전 UI/매칭을 돌려보기 위한 시드 데이터.
export const MOCK_COMPANIES: Company[] = [
  { id: "c1", name: "한빛정밀", industry: "기계/정밀가공", region: "성남", intro: "CNC 정밀가공 30년 강소기업", perks: "기숙사·자격수당·정규전환",
    hashtags: ["제조/정밀가공", "CNC", "캐드", "측정", "품질관리", "기계설계"] },
  { id: "c2", name: "코어로보틱스", industry: "로봇/자동화", region: "판교", intro: "협동로봇 SI 전문", perks: "스톡옵션·교육비",
    hashtags: ["로봇/자동화", "스타트업", "PLC", "전기제어", "임베디드", "자동화", "Python"] },
  { id: "c3", name: "그린에너지셀", industry: "이차전지", region: "성남", intro: "배터리 셀 품질 솔루션", perks: "4.5일제·중식제공",
    hashtags: ["이차전지", "품질관리", "데이터분석", "MES", "SQL"] },
  { id: "c4", name: "스마트팩토리원", industry: "스마트팩토리", region: "용인", intro: "MES/설비 데이터 플랫폼", perks: "유연근무·장비지원",
    hashtags: ["스마트팩토리", "IT/SW", "MES", "데이터엔지니어", "SQL", "백엔드개발", "React"] },
  { id: "c5", name: "넥스트커머스", industry: "이커머스", region: "판교", intro: "월 1,000만 방문 이커머스 플랫폼", perks: "재택근무·도서구입비",
    hashtags: ["이커머스", "IT/SW", "React", "TypeScript", "Node.js", "프론트엔드", "Figma"] },
  { id: "c6", name: "브라이트마케팅", industry: "마케팅/광고", region: "서울", intro: "데이터 기반 퍼포먼스 마케팅 그룹", perks: "성과급·유연출퇴근",
    hashtags: ["마케팅/광고", "스타트업", "마케팅", "콘텐츠기획", "데이터분석", "브랜딩"] },
];

export const MOCK_JOBS: Job[] = [
  { id: "j1", companyId: "c1", title: "CNC 가공 엔지니어", jobCategory: "기계설계", employmentType: "fulltime", region: "성남", requiredSkills: ["CNC", "캐드", "측정"], description: "정밀부품 가공 및 품질측정" },
  { id: "j2", companyId: "c2", title: "로봇 SI 어시스턴트", jobCategory: "자동화", employmentType: "intern", region: "판교", requiredSkills: ["PLC", "전기제어", "협동로봇"], description: "협동로봇 셋업·시운전 보조" },
  { id: "j3", companyId: "c3", title: "배터리 품질 분석원", jobCategory: "품질관리", employmentType: "fulltime", region: "성남", requiredSkills: ["품질", "데이터분석", "엑셀"], description: "셀 공정 품질 데이터 분석" },
  { id: "j4", companyId: "c4", title: "MES 데이터 운영", jobCategory: "데이터", employmentType: "contract", region: "용인", requiredSkills: ["SQL", "데이터분석", "설비"], description: "설비 데이터 수집·대시보드 운영" },
  { id: "j5", companyId: "c5", title: "프론트엔드 개발자 (신입/주니어)", jobCategory: "프론트엔드", employmentType: "fulltime", region: "판교", requiredSkills: ["React", "TypeScript", "HTML/CSS"], description: "이커머스 웹 프론트엔드 개발" },
  { id: "j6", companyId: "c6", title: "콘텐츠 마케터", jobCategory: "마케팅", employmentType: "fulltime", region: "서울", requiredSkills: ["마케팅", "콘텐츠기획", "데이터분석"], description: "SNS·콘텐츠 기반 퍼포먼스 마케팅" },
];

export const MOCK_STUDENT: StudentProfile = {
  userId: "s1",
  name: "김도윤",
  dept: "스마트기계과",
  region: "성남",
  skills: ["CNC", "캐드", "측정", "품질"],
  desiredJobs: ["기계설계", "품질관리"],
  intro: "정밀가공·품질에 강한 폴리텍 졸업예정자",
};

export const companyById = (id: string) => MOCK_COMPANIES.find((c) => c.id === id);
export const jobsByCompany = (cid: string) => MOCK_JOBS.filter((j) => j.companyId === cid);
