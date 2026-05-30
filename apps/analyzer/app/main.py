from datetime import datetime, timezone

from fastapi import FastAPI
from pydantic import BaseModel

# 게이트웨이가 "/analyze" prefix 를 그대로 전달한다.
# root_path 를 맞추면 OpenAPI 문서 경로(/analyze/docs)도 올바르게 생성된다.
app = FastAPI(root_path="/analyze")


class AnalyzeRequest(BaseModel):
    prompt: str


class AnalyzeResponse(BaseModel):
    result: str
    model: str


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "analyzer",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/run", response_model=AnalyzeResponse)
def run(req: AnalyzeRequest) -> AnalyzeResponse:
    # 실제 AI 추론 자리. 지금은 에코.
    return AnalyzeResponse(result=f"echo: {req.prompt}", model="stub-0")
