import { ImageResponse } from "next/og";

export const alt = "잡매칭 — 다음 기회를, 너에게";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#2436c7",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -160,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background: "rgba(198, 244, 50, 0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -180,
            width: 640,
            height: 640,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.06)",
          }}
        />
        <div
          style={{
            fontSize: 230,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-0.05em",
            lineHeight: 1,
            display: "flex",
          }}
        >
          Jobmatch
        </div>
        <div
          style={{
            marginTop: 30,
            height: 14,
            width: 360,
            background: "#c6f432",
            borderRadius: 999,
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            color: "#eef0ff",
            marginTop: 38,
            letterSpacing: "0.02em",
            display: "flex",
          }}
        >
          Connecting students &amp; companies
        </div>
        <div
          style={{
            fontSize: 30,
            color: "rgba(255, 255, 255, 0.7)",
            marginTop: 18,
            display: "flex",
          }}
        >
          jobmatch.accl.kr
        </div>
      </div>
    ),
    { ...size },
  );
}
