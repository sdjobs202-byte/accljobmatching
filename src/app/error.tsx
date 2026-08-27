"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * 앱 전역 에러 화면.
 *
 * 이 파일이 없으면 Next 는 아무 안내 없는 흰 화면
 * ("Application error: a client-side exception has occurred")만 띄운다.
 * 사용자는 무엇이 잘못됐는지도, 무엇을 해야 하는지도 알 수 없다.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 서버 로그(Vercel 런타임 로그)에 남겨 원인 추적이 가능하게 한다.
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-5 py-24 text-center">
      <h1 className="text-2xl font-bold mb-3">문제가 발생했습니다</h1>
      <p className="text-sm text-muted mb-8">
        요청을 처리하는 중 오류가 발생했습니다.<br />
        잠시 후 다시 시도해주세요. 계속 반복되면 아래 오류 번호와 함께 문의해주세요.
      </p>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-indigo text-white px-6 py-3 text-sm font-semibold hover:bg-indigo/90 transition-colors"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-muted hover:border-indigo hover:text-indigo transition-colors"
        >
          첫 화면으로
        </Link>
      </div>

      {error.digest && (
        <p className="mt-8 text-xs text-muted">
          오류 번호 <code className="font-mono">{error.digest}</code>
        </p>
      )}
    </div>
  );
}
