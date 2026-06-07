import { createAdminClient } from "./supabase/admin";

/**
 * 알림(카카오 알림톡 / 문자) 발송.
 * v1: notifications 테이블에 기록 + (키가 있으면) 실제 발송.
 * 공급사 키 미설정 시 DB 기록만 하고 콘솔 로깅(개발용).
 */
export type NotifyTemplate =
  | "application_received" // 기업: 새 지원 접수
  | "interview_confirmed" // 학생: 면접 확정
  | "application_rejected"; // 학생: 미선정

export async function notify(params: {
  userId: string;
  template: NotifyTemplate;
  channel?: "kakao" | "sms";
  payload?: Record<string, unknown>;
}) {
  const { userId, template, channel = "kakao", payload = {} } = params;
  const admin = createAdminClient();

  // 1) DB 기록 (감사·재발송 추적용)
  if (admin) {
    await admin.from("notifications").insert({
      user_id: userId,
      channel,
      template,
      payload,
      sent_at: process.env.KAKAO_ALIMTALK_API_KEY ? new Date().toISOString() : null,
    });
  }

  // 2) 실제 발송 (공급사 연동 자리)
  if (process.env.KAKAO_ALIMTALK_API_KEY) {
    // TODO: 카카오 알림톡 API 호출. 공급사(예: NHN/솔라피) SDK 연동.
    // 실패 시 sms 폴백.
  } else {
    console.info(`[notify:mock] ${channel}/${template} → user ${userId}`, payload);
  }
}
