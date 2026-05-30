# --- build stage ---
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages ./packages
COPY apps/blog ./apps/blog
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @apps/blog build

# --- runtime stage ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Next standalone 출력: 서버 + 최소 node_modules
COPY --from=builder /repo/apps/blog/.next/standalone ./
COPY --from=builder /repo/apps/blog/.next/static ./apps/blog/.next/static
COPY --from=builder /repo/apps/blog/public ./apps/blog/public
EXPOSE 3001
CMD ["node", "apps/blog/server.js"]
