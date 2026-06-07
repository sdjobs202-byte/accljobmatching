import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 — 잡매칭",
  description: "(ACCL) AI 커리어콘텐츠 연구소 잡매칭 서비스 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-3xl font-bold mb-2">개인정보처리방침</h1>
      <p className="text-sm text-muted mb-4">시행일: 2026년 6월 7일</p>

      <div className="rounded-xl bg-indigo-soft/50 p-4 text-xs text-ink/70 mb-10">
        ※ 본 방침은 표준 양식 기반 초안입니다. 정식 시행 전 [대표자·사업장 주소·사업자등록번호·
        개인정보보호책임자 연락처] 등 실제 정보를 채우고 법률 검토를 받으시기 바랍니다.
      </div>

      <div className="space-y-9 text-sm leading-7 text-ink/85">
        <section>
          <p>
            (ACCL) AI 커리어콘텐츠 연구소(이하 &ldquo;회사&rdquo;)는 「개인정보 보호법」 등 관련 법령을 준수하며,
            이용자의 개인정보를 보호하고 권익을 존중하기 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">1. 수집하는 개인정보 항목</h2>
          <p className="mb-2">회사는 잡매칭 서비스 제공을 위해 아래 항목을 수집합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><b>회원 공통</b>: 이메일, 비밀번호(암호화 저장), 이름, 휴대전화번호, 가입 유형(학생/기업)</li>
            <li><b>학생 회원</b>: 학과, 졸업예정연도, 거주 지역, 보유 역량, 희망 직무, 이력서 파일, 포트폴리오 링크, 자기소개</li>
            <li><b>기업 회원</b>: 회사명, 업종, 사업장 소재지, 회사 소개, 채용담당자 연락처</li>
            <li><b>지원 활동</b>: 지원 공고, 자기소개서, 지원 상태, 면접 일정</li>
            <li><b>자동 수집</b>: 접속 로그, 쿠키, 서비스 이용 기록</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">2. 개인정보의 수집·이용 목적</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>회원 가입 및 본인 확인, 서비스 이용에 따른 인증</li>
            <li>학생-기업 간 채용 매칭(적합도 산출) 및 지원·검토·면접확정 처리</li>
            <li>지원·검토 결과 등 알림(카카오 알림톡/문자) 발송</li>
            <li>서비스 운영·개선, 부정 이용 방지, 고객 문의 응대</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">3. 개인정보의 보유 및 이용기간</h2>
          <p>
            회원 탈퇴 시 또는 수집·이용 목적 달성 시 지체 없이 파기합니다. 다만 관계 법령에 따라
            보존이 필요한 경우 해당 기간 동안 보관합니다(예: 계약·청약철회 기록 5년, 소비자 불만·분쟁 처리 기록 3년,
            접속 로그 3개월 등).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">4. 개인정보의 제3자 제공</h2>
          <p>
            회사는 이용자의 동의 없이 개인정보를 외부에 제공하지 않습니다. 다만 <b>채용 매칭 특성상,
            학생이 특정 공고에 지원하는 경우 해당 기업 회원에게 지원에 필요한 정보(프로필·자기소개서·이력서 등)가
            제공</b>됩니다. 이는 지원 행위에 수반되는 필수적 제공입니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">5. 개인정보 처리의 위탁</h2>
          <p className="mb-2">회사는 서비스 운영을 위해 다음과 같이 업무를 위탁할 수 있습니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><b>Supabase</b>: 데이터베이스·인증·파일 저장(클라우드 인프라)</li>
            <li><b>Anthropic</b>: 매칭 적합도 보조 분석(AI) — 프로필·공고 텍스트 처리</li>
            <li><b>알림 발송 대행사</b>: 카카오 알림톡·문자 발송</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">6. 정보주체의 권리·의무 및 행사 방법</h2>
          <p>
            이용자는 언제든지 자신의 개인정보를 조회·수정하거나 처리 정지·삭제(회원 탈퇴)를 요청할 수 있습니다.
            마이페이지에서 직접 수정하거나 아래 연락처로 요청하실 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">7. 개인정보의 안전성 확보 조치</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>비밀번호 암호화 저장 및 전송 구간 암호화(HTTPS)</li>
            <li>행 수준 보안(RLS)을 통한 접근 권한 최소화</li>
            <li>개인정보 접근 권한의 분리 및 접근 기록 관리</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">8. 개인정보보호책임자</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>책임자: [성명 / 직책]</li>
            <li>연락처: [이메일] / [전화번호]</li>
          </ul>
          <p className="mt-2">
            기타 개인정보 침해에 대한 상담은 개인정보침해신고센터(118), 대검찰청(1301), 경찰청(182) 등에
            문의하실 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-ink">9. 고지의 의무</h2>
          <p>본 개인정보처리방침의 내용 추가·삭제·수정이 있을 경우 시행 7일 전부터 서비스 내 공지를 통해 안내합니다.</p>
        </section>
      </div>
    </div>
  );
}
