import type { NextConfig } from "next";

// redeploy: PR#3(관리자·기업 공고 추가/삭제) 프로덕션 반영을 위한 빌드 트리거
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
