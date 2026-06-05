import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_JOBS } from "@/lib/mock";
import { matchOne } from "@/lib/matching";
import { STATUS_LABEL, type AppStatus, type StudentProfile } from "@/lib/types";

type AppDetail = {
  student: StudentProfile;
  status: AppStatus;
  coverLetter: string;
  resumeLabel: string;
  portfolioUrl?: string;
  submittedAt: string;
};

const MOCK_APPS: Record<string, AppDetail> = {
  "j1-s1": {
    student: {
      userId: "s1", name: "김도윤", dept: "스마트기계과", region: "성남",
      skills: ["CNC", "캐드", "측정", "품질"],
      desiredJobs: ["기계설계", "품질관리"],
      intro: "정밀가공·품질에 강한 폴리텍 졸업예정자",
    },
    status: "reviewing",
    coverLetter:
      "안녕하세요. 저는 스마트기계과 졸업예정자 김도윤입니다.\n\n재학 중 CNC 가공 실습 300시간 이상을 이수했으며, 캐드 도면 독해와 측정기기 운용에 자신 있습니다. 한빛정밀의 '30년 강소기업' 정신과 제가 추구하는 장인 정신이 맞닿아 있다고 생각해 지원합니다.\n\n입사 후 빠르게 현장에 적응하여 팀에 기여하는 엔지니어가 되겠습니다.",
    resumeLabel: "김도윤_이력서.pdf",
    portfolioUrl: "https://github.com/example",
    submittedAt: "2026-06-03",
  },
  "j1-s2": {
    student: {
      userId: "s2", name: "이서연", dept: "전기과", region: "판교",
      skills: ["PLC", "전기제어"],
      desiredJobs: ["자동화"],
      intro: "전기제어 실습 다수, 협동로봇 교육 수료",
    },
    status: "submitted",
    coverLetter:
      "전기과 재학 중 PLC 프로그래밍과 전기제어 실습에 집중했습니다. 정밀가공 분야에도 관심이 있어 도전합니다.\n\n새로운 환경에서 빠르게 배우는 자세로 임하겠습니다.",
    resumeLabel: "이서연_이력서.pdf",
    submittedAt: "2026-06-04",
  },
  "j2-s2": {
    student: {
      userId: "s2", name: "이서연", dept: "전기과", region: "판교",
      skills: ["PLC", "전기제어"],
      desiredJobs: ["자동화"],
      intro: "전기제어 실습 다수, 협동로봇 교육 수료",
    },
    status: "interview_confirmed",
    coverLetter:
      "협동로봇 SI 분야에 깊은 관심을 갖고 있습니다. PLC 프로그래밍 2년 경험과 전기제어 실습을 바탕으로 코어로보틱스에서 성장하고 싶습니다.",
    resumeLabel: "이서연_이력서.pdf",
    submittedAt: "2026-06-01",
  },
};

const STATUS_CLS: Record<AppStatus, string> = {
  submitted: "badge-submitted",
  reviewing: "badge-reviewing",
  interview_confirmed: "badge-confirmed",
  rejected: "badge-rejected",
  hired: "badge-confirmed",
};

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  const app = MOCK_APPS[appId];
  if (!app) notFound();

  const [jobId] = appId.split("-");
  const job = MOCK_JOBS.find((j) => j.id === jobId);
  if (!job) notFound();

  const m = matchOne(app.student, job);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href={`/biz/applicants/${jobId}`}
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-indigo mb-8"
      >
        ← {job.title} 지원자 목록
      </Link>

      {/* 지원자 헤더 */}
      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{app.student.name}</h1>
          <p className="text-sm text-muted mt-1">
            {app.student.dept} · {app.student.region} · 지원일 {app.submittedAt}
          </p>
        </div>
        <span className={`badge ${STATUS_CLS[app.status]}`}>
          {STATUS_LABEL[app.status]}
        </span>
      </div>

      {/* 적합도 카드 */}
      <div className="mt-7 rounded-[18px] bg-indigo-soft p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="shrink-0">
          <div className="text-xs font-semibold text-indigo mb-1">AI 매칭 점수</div>
          <div className="text-5xl font-extrabold text-indigo leading-none">
            {m.finalScore}
            <span className="text-lg font-normal">/100</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-ink/80 mb-3">{m.reason}</p>
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills.map((s) => (
              <span
                key={s}
                className={`text-xs rounded-full px-2.5 py-1 font-semibold ${
                  app.student.skills.includes(s)
                    ? "bg-lime text-ink"
                    : "bg-white text-muted border border-line"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">
            초록 = 보유 역량, 회색 = 미보유
          </p>
        </div>
      </div>

      {/* 한 줄 소개 */}
      <div className="mt-8">
        <h2 className="font-bold mb-2">한 줄 소개</h2>
        <p className="text-sm text-ink/80 rounded-xl bg-gray-50 px-4 py-3">
          {app.student.intro}
        </p>
      </div>

      {/* 자기소개서 */}
      <div className="mt-6">
        <h2 className="font-bold mb-2">자기소개서</h2>
        <div className="rounded-xl border border-line px-5 py-4 text-sm text-ink/80 whitespace-pre-line leading-7">
          {app.coverLetter}
        </div>
      </div>

      {/* 파일 */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-full border border-indigo text-indigo px-5 py-2.5 text-sm font-semibold hover:bg-indigo hover:text-white transition-colors">
          📄 {app.resumeLabel}
        </button>
        {app.portfolioUrl && (
          <a
            href={app.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:border-indigo transition-colors"
          >
            🔗 포트폴리오 보기
          </a>
        )}
      </div>

      {/* 액션 */}
      <div className="mt-10 flex gap-3 border-t border-line pt-8">
        <button className="flex-1 rounded-xl bg-indigo text-white py-3.5 font-semibold hover:bg-indigo/90 transition-colors">
          면접 확정 통보
        </button>
        <button className="flex-1 rounded-xl border border-line py-3.5 font-semibold text-muted hover:border-red-300 hover:text-red-500 transition-colors">
          미선정 처리
        </button>
      </div>
      <p className="mt-3 text-xs text-muted text-center">
        확정·미선정 시 학생에게 카카오 알림톡이 자동 발송됩니다.
      </p>
    </div>
  );
}
