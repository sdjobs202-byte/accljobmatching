import Link from "next/link";
import { notFound } from "next/navigation";
import { STATUS_LABEL, type AppStatus } from "@/lib/types";
import { getApplicationDetail, type ResumeFile } from "@/lib/data";
import { IconDownload, IconFile } from "@/components/icons";
import StatusActions from "../../StatusActions";

const STATUS_CLS: Record<AppStatus, string> = {
  submitted: "badge-submitted",
  reviewing: "badge-reviewing",
  interview_confirmed: "badge-confirmed",
  rejected: "badge-rejected",
  hired: "badge-confirmed",
};

/** 첨부(이력서/포트폴리오) 미리보기 + 다운로드 카드. 형식은 buildAttachedFile 이 판별해 넘긴다. */
function AttachedFileCard({ file, studentName, label }: { file: ResumeFile; studentName: string; label: string }) {
  return (
    <div className="rounded-[18px] border border-line overflow-hidden bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-line bg-gray-50">
        <span className="flex items-center gap-2 text-sm font-semibold break-all">
          <IconFile className="shrink-0 text-muted" />
          {file.name}
        </span>
        <div className="flex items-center gap-2">
          <a href={file.viewUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs rounded-full border border-line px-3.5 py-1.5 font-semibold text-muted hover:border-indigo hover:text-indigo transition-colors">
            새 탭에서 열기
          </a>
          <a href={file.downloadUrl}
            className="inline-flex items-center gap-1.5 text-xs rounded-full bg-indigo text-white px-3.5 py-1.5 font-semibold hover:bg-indigo/90 transition-colors">
            <IconDownload size={15} />
            다운로드
          </a>
        </div>
      </div>

      {file.kind === "pdf" && (
        <iframe src={file.viewUrl} title={`${studentName} ${label} 미리보기`}
          className="w-full h-[720px] bg-gray-50" />
      )}
      {file.kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element -- 만료되는 서명 URL이라 next/image 최적화 대상이 아님
        <img src={file.viewUrl} alt={`${studentName} ${label} 미리보기`}
          className="w-full bg-gray-50" />
      )}
      {file.kind === "other" && (
        <p className="px-5 py-8 text-center text-sm text-muted">
          브라우저에서 미리볼 수 없는 형식입니다. 다운로드해서 확인해주세요.
        </p>
      )}
    </div>
  );
}

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  const app = await getApplicationDetail(appId);
  if (!app) notFound();

  const { student, job } = app;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href={`/biz/applicants/${job.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-indigo mb-8"
      >
        ← {job.title} 지원자 목록
      </Link>

      {/* 지원자 헤더 */}
      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <p className="text-sm text-muted mt-1">
            {student.dept} · {student.region} · 지원일 {app.submittedAt}
          </p>
        </div>
        <span className={`badge ${STATUS_CLS[app.status]}`}>{STATUS_LABEL[app.status]}</span>
      </div>

      {/* 요구 역량 보유 현황 */}
      <div className="mt-7 rounded-[18px] bg-indigo-soft p-6">
        <div className="text-xs font-semibold text-indigo mb-3">요구 역량 보유 현황</div>
        <div className="flex flex-wrap gap-1.5">
          {job.requiredSkills.map((s) => (
            <span
              key={s}
              className={`text-xs rounded-full px-2.5 py-1 font-semibold ${
                student.skills.includes(s)
                  ? "bg-lime text-ink"
                  : "bg-white text-muted border border-line"
              }`}
            >
              {s}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted mt-2">초록 = 보유 역량, 회색 = 미보유</p>
      </div>

      {/* 한 줄 소개 */}
      {student.intro && (
        <div className="mt-8">
          <h2 className="font-bold mb-2">한 줄 소개</h2>
          <p className="text-sm text-ink/80 rounded-xl bg-gray-50 px-4 py-3">{student.intro}</p>
        </div>
      )}

      {/* 자기소개서 */}
      <div className="mt-6">
        <h2 className="font-bold mb-2">자기소개서</h2>
        <div className="rounded-xl border border-line px-5 py-4 text-sm text-ink/80 whitespace-pre-line leading-7">
          {app.coverLetter || "작성된 자기소개서가 없습니다."}
        </div>
      </div>

      {/* 지원 서류 — 미리보기 + 다운로드 */}
      <div className="mt-8">
        <h2 className="font-bold mb-2">이력서</h2>
        {app.resume ? (
          <AttachedFileCard file={app.resume} studentName={student.name} label="이력서" />
        ) : (
          <p className="rounded-xl border border-line px-5 py-4 text-sm text-muted">이력서 미첨부</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-bold mb-2">포트폴리오</h2>
        {app.portfolio ? (
          <AttachedFileCard file={app.portfolio} studentName={student.name} label="포트폴리오" />
        ) : (
          <p className="rounded-xl border border-line px-5 py-4 text-sm text-muted">포트폴리오 미첨부</p>
        )}
      </div>

      {/* 액션 */}
      <div className="mt-10 border-t border-line pt-8">
        <StatusActions applicationId={app.applicationId} status={app.status} size="lg" />
      </div>
      <p className="mt-3 text-xs text-muted text-center">
        확정·미선정 시 학생에게 카카오 알림톡이 자동 발송됩니다.
      </p>
    </div>
  );
}
