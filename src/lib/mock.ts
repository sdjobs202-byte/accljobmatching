import type { Company, Job, StudentProfile } from "./types";

// Supabase 연결 전 UI/매칭을 돌려보기 위한 시드 데이터.
// 기업 10곳 · 공고 10개(회사당 1개) · 학생 10명 — 업종/스택을 골고루 배분.
export const MOCK_COMPANIES: Company[] = [
  { id: "c1", name: "한빛정밀", industry: "기계/정밀가공", region: "성남", intro: "CNC 정밀가공 30년 강소기업", perks: "기숙사·자격수당·정규전환",
    hashtags: ["제조/정밀가공", "CNC", "캐드", "Solidworks", "품질관리", "기계설계"] },
  { id: "c2", name: "코어로보틱스", industry: "로봇/자동화", region: "판교", intro: "협동로봇 SI 전문", perks: "스톡옵션·교육비",
    hashtags: ["로봇/자동화", "스타트업", "PLC", "임베디드", "임베디드개발", "자동화", "Python"] },
  { id: "c3", name: "그린에너지셀", industry: "이차전지", region: "성남", intro: "배터리 셀 품질 솔루션", perks: "4.5일제·중식제공",
    hashtags: ["이차전지", "품질관리", "데이터분석", "MES", "SQL"] },
  { id: "c4", name: "스마트팩토리원", industry: "스마트팩토리", region: "용인", intro: "MES/설비 데이터 플랫폼", perks: "유연근무·장비지원",
    hashtags: ["스마트팩토리", "IT/SW", "MES", "공장자동화", "데이터엔지니어", "SQL", "백엔드개발", "React"] },
  { id: "c5", name: "넥스트커머스", industry: "이커머스", region: "판교", intro: "월 1,000만 방문 이커머스 플랫폼", perks: "재택근무·도서구입비",
    hashtags: ["이커머스", "IT/SW", "React", "TypeScript", "Node.js", "프론트엔드", "Figma"] },
  { id: "c6", name: "브라이트마케팅", industry: "마케팅/광고", region: "서울", intro: "데이터 기반 퍼포먼스 마케팅 그룹", perks: "성과급·유연출퇴근",
    hashtags: ["마케팅/광고", "스타트업", "마케팅", "콘텐츠기획", "데이터분석", "브랜딩"] },
  { id: "c7", name: "딥비전랩", industry: "AI/데이터", region: "서울", intro: "영상인식·자연어처리 AI 모델 개발사", perks: "GPU워크스테이션·논문지원",
    hashtags: ["AI/데이터", "스타트업", "Python", "머신러닝", "딥러닝", "영상인식", "자연어처리", "데이터분석"] },
  { id: "c8", name: "픽셀게임즈", industry: "게임", region: "판교", intro: "모바일·PC 크로스플랫폼 게임 스튜디오", perks: "닌텐도데이·간식바",
    hashtags: ["게임", "Unity", "C#", "C++", "클라이언트개발", "게임기획", "게임운영", "QA"] },
  { id: "c9", name: "웹플로우소프트", industry: "IT/SW", region: "서울", intro: "공공·금융 SI 웹 서비스 개발사", perks: "자격증수당·정규전환",
    hashtags: ["IT/SW", "Java", "JSP", "Spring", "SQL", "웹개발", "백엔드개발", "REST API"] },
  { id: "c10", name: "클라우드메시", industry: "IT/SW", region: "성남", intro: "클라우드 인프라·DevOps 컨설팅", perks: "원격근무·클라우드자격지원",
    hashtags: ["IT/SW", "AWS", "클라우드", "Docker", "서버관리", "백엔드개발", "Node.js"] },
];

export const MOCK_JOBS: Job[] = [
  { id: "j1", companyId: "c1", title: "CNC 가공 엔지니어", jobCategory: "기계설계", employmentType: "fulltime", region: "성남", requiredSkills: ["CNC", "캐드", "Solidworks"], description: "정밀부품 가공 및 품질측정" },
  { id: "j2", companyId: "c2", title: "로봇 SI 어시스턴트", jobCategory: "자동화", employmentType: "intern", region: "판교", requiredSkills: ["PLC", "임베디드", "자동화"], description: "협동로봇 셋업·시운전 보조" },
  { id: "j3", companyId: "c3", title: "배터리 품질 분석원", jobCategory: "품질관리", employmentType: "fulltime", region: "성남", requiredSkills: ["품질관리", "데이터분석", "SQL"], description: "셀 공정 품질 데이터 분석" },
  { id: "j4", companyId: "c4", title: "MES 데이터 운영", jobCategory: "데이터엔지니어", employmentType: "contract", region: "용인", requiredSkills: ["SQL", "데이터분석", "공장자동화"], description: "설비 데이터 수집·대시보드 운영" },
  { id: "j5", companyId: "c5", title: "프론트엔드 개발자 (신입/주니어)", jobCategory: "프론트엔드", employmentType: "fulltime", region: "판교", requiredSkills: ["React", "TypeScript", "HTML/CSS"], description: "이커머스 웹 프론트엔드 개발" },
  { id: "j6", companyId: "c6", title: "콘텐츠 마케터", jobCategory: "마케팅", employmentType: "fulltime", region: "서울", requiredSkills: ["마케팅", "콘텐츠기획", "데이터분석"], description: "SNS·콘텐츠 기반 퍼포먼스 마케팅" },
  { id: "j7", companyId: "c7", title: "AI 엔지니어 (비전/NLP)", jobCategory: "인공지능", employmentType: "fulltime", region: "서울", requiredSkills: ["Python", "딥러닝", "영상인식", "자연어처리"], description: "영상인식·자연어처리 모델 학습 및 서빙" },
  { id: "j8", companyId: "c8", title: "게임 클라이언트 개발자", jobCategory: "클라이언트개발", employmentType: "fulltime", region: "판교", requiredSkills: ["Unity", "C#", "클라이언트개발"], description: "Unity 기반 게임 클라이언트 개발" },
  { id: "j9", companyId: "c9", title: "백엔드 웹 개발자", jobCategory: "백엔드개발", employmentType: "fulltime", region: "서울", requiredSkills: ["Java", "Spring", "JSP", "SQL"], description: "공공·금융 웹 서비스 백엔드 개발" },
  { id: "j10", companyId: "c10", title: "클라우드/서버 엔지니어", jobCategory: "서버관리", employmentType: "fulltime", region: "성남", requiredSkills: ["AWS", "클라우드", "Docker", "서버관리"], description: "클라우드 인프라 구축·운영(DevOps)" },
];

// 학생 회원 10명 — 학과/스택을 카테고리별로 배분.
export const MOCK_STUDENTS: StudentProfile[] = [
  { userId: "s1", name: "김도윤", dept: "스마트기계과", region: "성남",
    skills: ["CNC", "캐드", "Solidworks", "품질관리"], desiredJobs: ["기계설계", "품질관리"],
    intro: "정밀가공·품질에 강한 폴리텍 졸업예정자" },
  { userId: "s2", name: "이서준", dept: "컴퓨터공학과", region: "판교",
    skills: ["React", "TypeScript", "Node.js", "JavaScript"], desiredJobs: ["프론트엔드", "풀스택"],
    intro: "웹 프론트엔드 사이드프로젝트 다수 경험" },
  { userId: "s3", name: "박지우", dept: "인공지능과", region: "서울",
    skills: ["Python", "머신러닝", "딥러닝", "자연어처리"], desiredJobs: ["인공지능", "데이터분석가"],
    intro: "NLP 논문 재현·영상인식 프로젝트 경험" },
  { userId: "s4", name: "최유나", dept: "소프트웨어과", region: "서울",
    skills: ["Java", "Spring", "JSP", "SQL"], desiredJobs: ["백엔드개발", "웹개발"],
    intro: "Spring 기반 팀 프로젝트로 SI 실무 대비" },
  { userId: "s5", name: "정민재", dept: "게임콘텐츠과", region: "판교",
    skills: ["Unity", "C#", "C++"], desiredJobs: ["클라이언트개발", "게임기획"],
    intro: "Unity로 인디게임 2편 출시" },
  { userId: "s6", name: "한소율", dept: "임베디드시스템과", region: "성남",
    skills: ["C++", "임베디드", "PLC"], desiredJobs: ["임베디드개발", "자동화"],
    intro: "펌웨어·PLC 제어 캡스톤 우수상" },
  { userId: "s7", name: "오현우", dept: "정보통신과", region: "성남",
    skills: ["AWS", "클라우드", "Docker", "Node.js"], desiredJobs: ["서버관리", "백엔드개발"],
    intro: "클라우드 자격증 보유, 홈랩 인프라 운영" },
  { userId: "s8", name: "강다은", dept: "시각디자인과", region: "서울",
    skills: ["Figma", "포토샵", "UI디자인", "프로토타이핑"], desiredJobs: ["디자이너", "프론트엔드"],
    intro: "UI/UX 포트폴리오·디자인시스템 관심" },
  { userId: "s9", name: "윤지호", dept: "데이터과학과", region: "서울",
    skills: ["Python", "SQL", "데이터분석", "텍스트마이닝"], desiredJobs: ["데이터분석가", "데이터엔지니어"],
    intro: "웹크롤링·텍스트마이닝 분석 리포트 다수" },
  { userId: "s10", name: "서예린", dept: "스마트팩토리과", region: "용인",
    skills: ["PLC", "MES", "SQL", "데이터분석"], desiredJobs: ["자동화", "공장자동화"],
    intro: "스마트팩토리 설비 데이터 운영 실습 경험" },
];

// 미로그인/미설정 시 기본 학생(하위 호환용 단일 export).
export const MOCK_STUDENT: StudentProfile = MOCK_STUDENTS[0];

export const companyById = (id: string) => MOCK_COMPANIES.find((c) => c.id === id);
export const jobsByCompany = (cid: string) => MOCK_JOBS.filter((j) => j.companyId === cid);
export const studentById = (uid: string) => MOCK_STUDENTS.find((s) => s.userId === uid);
