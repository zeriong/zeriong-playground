import { POKE_API_BASE } from "../config";

// 얇은 fetch 래퍼. 엔드포인트별 지식은 갖지 않는다 (그건 entities 의 책임).
// URL 이 절대경로면 그대로, 상대경로면 API_BASE 를 붙인다.
export async function httpGet<T>(path: string): Promise<T> {
  const url = path.startsWith("http") ? path : `${POKE_API_BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${url}`);
  }
  return res.json() as Promise<T>;
}
