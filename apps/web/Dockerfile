# --- build stage ---
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /repo

# 워크스페이스 매니페스트만 먼저 복사해 의존성 캐시 최적화
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN pnpm install --frozen-lockfile

# web 과 그 의존 패키지만 빌드
RUN pnpm --filter @apps/web build

# --- runtime stage ---
FROM nginx:1.27-alpine
COPY apps/web/nginx.spa.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 80
