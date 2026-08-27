import type { NextConfig } from "next";

// redeploy: PR#3(관리자·기업 공고 추가/삭제) 프로덕션 반영을 위한 빌드 트리거
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    serverActions: {
      // 이력서 PDF는 서버 액션 본문에 실려 전송된다(Storage 업로드가 서버에서 일어남).
      // Next 기본값 1MB로는 웬만한 이력서가 막히고, 초과 시 에러 바운더리가 없어
      // "Application error: a client-side exception" 흰 화면으로 떨어졌다.
      // 폼에서 8MB로 먼저 거르므로 여기는 여유분을 둔다.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
