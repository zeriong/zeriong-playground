import { useState } from "react";
import type { AnalyzeResponse, HealthResponse } from "@repo/types";

export function App() {
  const [health, setHealth] = useState<string>("");
  const [result, setResult] = useState<string>("");

  async function checkApi() {
    const res = await fetch("/api/health");
    const data: HealthResponse = await res.json();
    setHealth(`${data.service}: ${data.status}`);
  }

  async function runAnalyze() {
    const res = await fetch("/analyze/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "hello" }),
    });
    const data: AnalyzeResponse = await res.json();
    setResult(`${data.model}: ${data.result}`);
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: 32 }}>
      <h1>Zeriong Platform — Web (React SPA)</h1>
      <p>게이트웨이의 "/" 경로에 서빙되는 메인 앱입니다.</p>
      <button onClick={checkApi}>Check Nest API (/api)</button> <span>{health}</span>
      <br />
      <button onClick={runAnalyze}>Run Python Analyzer (/analyze)</button> <span>{result}</span>
    </main>
  );
}
