// API <-> Frontend 공유 타입. Nest.js 와 React/Next.js 가 동일한 계약을 사용.

export interface HealthResponse {
  status: "ok";
  service: string;
  timestamp: string;
}

export interface AnalyzeRequest {
  prompt: string;
}

export interface AnalyzeResponse {
  result: string;
  model: string;
}
