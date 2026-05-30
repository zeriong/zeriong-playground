# Zeriong Platform

여러 기술 스택(React / Next.js / Nest.js / Python)을 **하나의 도메인**으로 묶어
경로별로 라우팅하는 멀티 스택 모노레포. 온프레미스 Docker 배포.

## 라우팅

| 경로 | 앱 | 스택 | 포트 |
|------|-----|------|------|
| `/` | `apps/web` | React SPA (Vite) | 80 (컨테이너) |
| `/blog` | `apps/blog` | Next.js (basePath=/blog) | 3001 |
| `/api` | `apps/api` | Nest.js (globalPrefix=api) | 4000 |
| `/analyze` | `apps/analyzer` | Python FastAPI (root_path=/analyze) | 8000 |

앞단 **Nginx 게이트웨이**(`infra/gateway/nginx.conf`)가 경로로 분배한다.

## 구조

```
apps/        web, blog, api (pnpm 워크스페이스) + analyzer (Python, 격리)
packages/    types(API↔FE 공유), tsconfig, eslint-config
infra/       gateway(nginx), docker-compose.yml
.github/     CI/CD (변경된 앱만 빌드·배포)
```

## 개발

```bash
pnpm install
pnpm dev            # turbo 가 web/blog/api 동시 실행
# analyzer 는 별도:
cd apps/analyzer && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
```

dev 중에는 web(vite)의 proxy 가 `/api`, `/analyze` 를 직접 백엔드로 넘긴다.

## 전체 실행 (게이트웨이 포함, Docker)

```bash
docker compose -f infra/docker-compose.yml up --build
# http://localhost/        -> web
# http://localhost/blog    -> blog
# http://localhost/api/health
# http://localhost/analyze/health
```

## CI/CD 흐름

1. push → `dorny/paths-filter` 로 변경된 앱 감지
2. `verify` 잡: turbo lint/typecheck/build (캐시)
3. `build-push` 잡: 변경된 앱만 GHCR 에 이미지 푸시
4. `deploy` 잡: 온프레미스 self-hosted runner 에서 `docker compose pull && up -d`

> 운영 시 `infra/docker-compose.yml` 의 `build:` 를 `image:` 로 교체(주석 참고).

## 새 앱(페이지) 추가 절차

1. `apps/<name>` 생성 (+ Dockerfile)
2. `pnpm-workspace.yaml` 에 등록(JS/TS 인 경우)
3. `infra/gateway/nginx.conf` 에 `location /<name>/` 추가
4. `infra/docker-compose.yml` 에 서비스 추가
5. `.github/workflows/ci.yml` 의 paths-filter / matrix 에 추가
```
