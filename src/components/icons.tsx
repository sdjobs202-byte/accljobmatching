/**
 * 관리자 콘솔용 라인 아이콘 세트.
 *
 * 이모지는 OS·브라우저마다 모양과 색이 제각각이라(윈도우/맥/안드로이드가 전부 다르게 그린다)
 * 관리자 화면처럼 밀도 높은 UI에서는 톤이 깨진다. 굵기·크기·색이 일정한 SVG로 통일한다.
 * 색은 `currentColor`를 따르므로 부모의 text 색상(hover 포함)이 그대로 적용된다.
 */
import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  /** px 기준 크기. 기본 18 */
  size?: number;
};

function Icon({ size = 18, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** 대시보드 — 4분할 그리드 */
export function IconDashboard(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icon>
  );
}

/** 회원 관리 — 사람 둘 */
export function IconUsers(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
      <circle cx="10" cy="8" r="3.2" />
      <path d="M20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4" />
      <path d="M15.5 5.2a3.2 3.2 0 0 1 0 5.6" />
    </Icon>
  );
}

/** 기업 등록 — 건물 */
export function IconBuilding(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 21h16" />
      <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M10 7h1M13 7h1M10 11h1M13 11h1M10 15h1M13 15h1" />
    </Icon>
  );
}

/** 공고 관리 — 클립보드 목록 */
export function IconClipboardList(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1Z" />
      <path d="M16 5h1.5A1.5 1.5 0 0 1 19 6.5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-13A1.5 1.5 0 0 1 6.5 5H8" />
      <path d="M9 11h6M9 15h4" />
    </Icon>
  );
}

/** 공고 등록 — 펜 */
export function IconPencil(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="M14.5 6.5l3 3" />
    </Icon>
  );
}

/** 매칭 현황 — 번개 */
export function IconBolt(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13 2 5 13.5h6L10.5 22 19 10.5h-6L13 2Z" />
    </Icon>
  );
}

/** 지원 현황 — 겹친 서류 */
export function IconDocuments(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 3h5l4 4v10a1.5 1.5 0 0 1-1.5 1.5h-7.5A1.5 1.5 0 0 1 6.5 17V4.5A1.5 1.5 0 0 1 8 3Z" />
      <path d="M13 3v4h4" />
      <path d="M17.5 20.5H9" />
    </Icon>
  );
}

/** 면접 확정 — 체크 원 */
export function IconCheckCircle(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </Icon>
  );
}

/** 미선정 — X 원 */
export function IconXCircle(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </Icon>
  );
}

/** 첨부 파일 */
export function IconFile(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13 3H7.5A1.5 1.5 0 0 0 6 4.5v15A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V8l-5-5Z" />
      <path d="M13 3v5h5" />
    </Icon>
  );
}

/** 다운로드 */
export function IconDownload(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v10" />
      <path d="m8 11 4 4 4-4" />
      <path d="M5 19h14" />
    </Icon>
  );
}

/** 되돌리기 — 반시계 화살표 */
export function IconRotateCcw(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 5v5h5" />
      <path d="M3.5 10a8.5 8.5 0 1 1 1.2 7" />
    </Icon>
  );
}

/** 오른쪽 화살표 — 로고 없는 기업의 자리표시 배지 등 */
export function IconChevronRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 5l7 7-7 7" />
    </Icon>
  );
}

/** 외부 링크 */
export function IconExternalLink(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10" />
    </Icon>
  );
}
