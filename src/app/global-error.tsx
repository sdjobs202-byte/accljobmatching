"use client";

import { useEffect } from "react";

/**
 * 루트 레이아웃 자체가 깨졌을 때의 최후 방어선.
 * error.tsx 는 레이아웃 안에서 렌더되므로 레이아웃이 터지면 잡지 못한다.
 * 이 컴포넌트는 <html>/<body>를 직접 그려야 한다.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "24px",
          textAlign: "center",
          color: "#1a1a1a",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            일시적인 오류가 발생했습니다
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24, lineHeight: 1.7 }}>
            페이지를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: 0,
              borderRadius: 999,
              background: "#2436C7",
              color: "#fff",
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
          {error.digest && (
            <p style={{ marginTop: 24, fontSize: 12, color: "#9ca3af" }}>
              오류 번호 {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
