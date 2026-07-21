import { ImageResponse } from "next/og";

export const alt = "잡매칭 — 다음 기회를, 너에게";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 한글 렌더용 폰트(Noto Sans KR)를 필요한 글자만 서브셋으로 받아온다.
// satori는 woff2 미지원 → 구형 User-Agent로 요청해 ttf를 받는다.
async function loadKoreanFont(text: string, weight: number) {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}&text=${encodeURIComponent(
    text,
  )}`;
  const css = await (
    await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.93 Safari/537.36",
      },
    })
  ).text();
  const m = css.match(/src: url\((https:\/\/[^)]+)\) format\('(woff|opentype|truetype)'\)/);
  if (!m) throw new Error("Korean font fetch failed");
  return fetch(m[1]).then((r) => r.arrayBuffer());
}

export default async function Image() {
  const text = "잡매칭 다음 기회를, 너에게 jobmatch.accl.kr";
  const font = await loadKoreanFont(text, 800);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 72,
          position: "relative",
          fontFamily: "Noto",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -170,
            right: -170,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "rgba(36, 54, 199, 0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -190,
            left: -190,
            width: 580,
            height: 580,
            borderRadius: "50%",
            background: "rgba(198, 244, 50, 0.20)",
          }}
        />

        {/* 잡매칭 로고 (왼쪽) */}
        <svg width="250" height="250" viewBox="0 0 100 100" fill="none">
          <rect width="100" height="100" rx="22" fill="#2436C7" />
          <path d="M22 26 C24 52 38 64 50 73" stroke="white" strokeWidth="10" strokeLinecap="round" />
          <path d="M78 26 C76 52 62 64 50 73" stroke="white" strokeWidth="10" strokeLinecap="round" />
          <circle cx="22" cy="26" r="9" fill="white" />
          <circle cx="78" cy="26" r="9" fill="white" />
          <circle cx="50" cy="73" r="12" fill="#C6F432" />
        </svg>

        {/* 텍스트 (오른쪽) */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 150,
              fontWeight: 800,
              color: "#2436c7",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              display: "flex",
            }}
          >
            잡매칭
          </div>
          <div
            style={{
              fontSize: 46,
              fontWeight: 800,
              color: "#0c1024",
              marginTop: 26,
              display: "flex",
            }}
          >
            다음 기회를, 너에게
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#6b7280",
              marginTop: 18,
              display: "flex",
            }}
          >
            jobmatch.accl.kr
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto", data: font, weight: 800, style: "normal" }],
    },
  );
}
