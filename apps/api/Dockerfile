# --- build stage ---
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @apps/api build
# 프로덕션 의존성만 단일 폴더로 평탄화해 추출 (심볼릭 링크 없는 독립 node_modules).
# pnpm v10 의 deploy 는 inject-workspace-packages 설정이 필요 (.npmrc 참고).
RUN pnpm --filter @apps/api deploy --prod /out

# --- runtime stage ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /out/node_modules ./node_modules
COPY --from=builder /repo/apps/api/dist ./dist
EXPOSE 4000
CMD ["node", "dist/main.js"]
