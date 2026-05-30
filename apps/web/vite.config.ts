import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 메인 SPA 는 게이트웨이의 "/" 경로에 마운트된다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // 개발 중 API 호출은 게이트웨이 대신 직접 Nest 로 프록시
    proxy: {
      "/api": "http://localhost:4000",
      "/analyze": "http://localhost:8000",
    },
  },
});
