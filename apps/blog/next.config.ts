import type { NextConfig } from "next";

// 게이트웨이의 "/blog" 경로 하위에 마운트되므로 basePath 를 맞춘다.
// standalone 출력으로 Docker 이미지를 가볍게 만든다.
const nextConfig: NextConfig = {
  basePath: "/blog",
  output: "standalone",
};

export default nextConfig;
