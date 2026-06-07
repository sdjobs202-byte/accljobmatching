import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 — 잡매칭",
  description: "(ACCL) AI 커리어콘텐츠 연구소 잡매칭 서비스 이용약관",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-3xl font-bold mb-2">이용약관</h1>
      <p className="text-sm text-muted mb-4">시행일: 2026년 6월 7일</p>

      <div className="rounded-xl bg-indigo-soft/50 p-4 text-xs text-ink/70 mb-10">
        ※ 본 약관은 표준 양식 기반 초안입니다. 정식 시행 전 회사 정보·환불/분쟁 조항 등을 보완하고
        법률 검토를 받으시기 바랍니다.
      </div>

      <div className="space-y-9 text-sm leading-7 text-ink/85">
        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">제1조 (목적)</h2>
          <p>
            본 약관은 (ACCL) AI 커리어콘텐츠 연구소(이하 &ldquo;회사&rdquo;)가 제공하는 잡매칭 서비스(이하 &ldquo;서비스&rdquo;)의
            이용과 관련하여 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">제2조 (정의)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><b>이용자</b>: 본 약관에 따라 서비스를 이용하는 학생 회원 및 기업 회원을 말합니다.</li>
            <li><b>학생 회원</b>: 프로필을 등록하고 채용 공고에 지원하는 개인 이용자.</li>
            <li><b>기업 회원</b>: 채용 공고를 등록하고 지원자를 검토하는 사업자 이용자.</li>
            <li><b>매칭</b>: 조건 필터와 AI 보조 점수를 통해 적합도를 산출·정렬하는 기능.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">제3조 (약관의 효력 및 변경)</h2>
          <p>
            본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는 관련 법령을 위반하지 않는 범위에서
            약관을 변경할 수 있으며, 변경 시 시행일 7일 전부터 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">제4조 (회원가입)</h2>
          <p>
            이용자는 회사가 정한 양식에 정보를 기입하고 본 약관 및 개인정보처리방침에 동의함으로써 회원가입을
            신청하며, 회사가 이를 승낙함으로써 가입이 완료됩니다. 타인의 정보를 도용하거나 허위 정보를 기재한 경우
            이용이 제한될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">제5조 (서비스의 제공)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>프로필·공고 등록 및 조건·AI 기반 매칭</li>
            <li>지원서 제출, 지원자 검토, 면접 확정 등 채용 절차 지원</li>
            <li>지원·검토 결과에 대한 알림 발송</li>
          </ul>
          <p className="mt-2">
            회사는 시스템 점검, 설비 장애 등 부득이한 경우 서비스 제공을 일시 중단할 수 있으며, 이 경우 사전 또는
            사후에 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">제6조 (이용자의 의무)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>가입 정보 및 등록 콘텐츠를 사실에 근거하여 작성할 것</li>
            <li>타인의 개인정보·지식재산권을 침해하지 않을 것</li>
            <li>매칭·지원 과정에서 취득한 타인의 정보를 채용 목적 외로 이용하지 않을 것</li>
            <li>서비스의 정상적 운영을 방해하는 행위를 하지 않을 것</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">제7조 (AI 매칭 결과에 관한 고지)</h2>
          <p>
            매칭 적합도 점수와 코멘트는 조건 필터에 기반한 결정론적 점수와 AI 보조 분석을 결합한 <b>참고 정보</b>이며,
            채용 여부에 대한 최종 판단과 책임은 각 기업 회원에게 있습니다. 회사는 매칭 결과가 특정 채용 성사를
            보장하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">제8조 (계약 해지 및 이용 제한)</h2>
          <p>
            이용자는 언제든지 회원 탈퇴를 요청할 수 있으며, 회사는 이용자가 본 약관을 위반한 경우 사전 통지 후
            이용을 제한하거나 계약을 해지할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">제9조 (책임의 제한)</h2>
          <p>
            회사는 천재지변, 이용자의 귀책사유, 기업·학생 간 채용 과정에서 발생한 분쟁 등 회사의 통제 범위를 벗어난
            사유로 인한 손해에 대해 책임을 지지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">제10조 (준거법 및 관할)</h2>
          <p>
            본 약관은 대한민국 법령에 따라 해석되며, 서비스 이용과 관련한 분쟁에 대해서는 회사 소재지를 관할하는
            법원을 전속 관할 법원으로 합니다.
          </p>
        </section>

        <section className="border-t border-line pt-6 text-xs text-muted">
          <p>부칙: 본 약관은 2026년 6월 7일부터 시행합니다.</p>
        </section>
      </div>
    </div>
  );
}
