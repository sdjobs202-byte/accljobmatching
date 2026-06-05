import Link from "next/link";

interface LogoProps {
  /** px 기준 아이콘 크기. 기본 28 */
  iconSize?: number;
  /** 워드마크 표시 여부. 기본 true */
  wordmark?: boolean;
  /** href. 기본 "/" */
  href?: string;
}

export function Logo({ iconSize = 28, wordmark = true, href = "/" }: LogoProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 shrink-0">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="100" height="100" rx="22" fill="#2436C7" />
        {/* 학생 경로 */}
        <path
          d="M22 26 C24 52 38 64 50 73"
          stroke="white"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* 기업 경로 */}
        <path
          d="M78 26 C76 52 62 64 50 73"
          stroke="white"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* 학생 노드 */}
        <circle cx="22" cy="26" r="9" fill="white" />
        {/* 기업 노드 */}
        <circle cx="78" cy="26" r="9" fill="white" />
        {/* 매칭 포인트 (라임) */}
        <circle cx="50" cy="73" r="12" fill="#C6F432" />
      </svg>

      {wordmark && (
        <span className="font-extrabold text-lg tracking-tight text-indigo leading-none">
          잡매칭
        </span>
      )}
    </Link>
  );
}
