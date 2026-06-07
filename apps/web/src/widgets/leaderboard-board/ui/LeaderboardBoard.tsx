import type { ScoreRecord } from "../../../entities/score-record";

const MEDALS = ["🥇", "🥈", "🥉"];

// 순수 뷰: 상위 10위 랭킹표. highlightAt 인덱스의 행을 강조(방금 등록한 기록).
export function LeaderboardBoard({
  records,
  highlightAt,
}: {
  records: ScoreRecord[];
  highlightAt?: number;
}) {
  if (records.length === 0) {
    return (
      <div style={{ color: "rgba(255,255,255,0.55)", padding: "24px 0", fontSize: 15 }}>
        아직 기록이 없어요. 첫 도전을 해보세요! 🍎
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {records.map((r, i) => {
        const highlight = i === highlightAt;
        return (
          <div
            key={`${r.at}-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 12,
              background: highlight
                ? "linear-gradient(135deg, rgba(255,107,107,0.35), rgba(255,161,74,0.35))"
                : "rgba(255,255,255,0.06)",
              border: highlight
                ? "1px solid rgba(255,210,63,0.7)"
                : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ width: 32, fontWeight: 800, fontSize: 18, textAlign: "center" }}>
              {MEDALS[i] ?? i + 1}
            </span>
            <span style={{ flex: 1, textAlign: "left", color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
              {formatDate(r.at)}
            </span>
            <span style={{ fontWeight: 800, fontSize: 20, color: highlight ? "#ffd23f" : "#fff" }}>
              {r.score.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
