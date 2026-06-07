import { START_LIVES } from "../../../features/fruit-game/model/constants";

// 순수 뷰: 인게임 HUD. 좌측 점수, 우측 일시정지 버튼, 하단 생명.
export function GameHud({
  score,
  lives,
  timeLeft,
  onPause,
}: {
  score: number;
  lives: number;
  timeLeft: number;
  onPause: () => void;
}) {
  // 10초 이하 남으면 시간 강조(붉게).
  const urgent = timeLeft <= 10;
  return (
    <>
      {/* 점수 + 타이머 (좌상단) */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 20,
          display: "flex",
          gap: 10,
        }}
      >
        <div
          style={{
            background: "rgba(8,6,20,0.45)",
            backdropFilter: "blur(8px)",
            borderRadius: 16,
            padding: "10px 18px",
            color: "#fff",
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: 1, color: "rgba(255,255,255,0.6)" }}>
            SCORE
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>
            {score.toLocaleString()}
          </div>
        </div>
        <div
          style={{
            background: "rgba(8,6,20,0.45)",
            backdropFilter: "blur(8px)",
            borderRadius: 16,
            padding: "10px 18px",
            color: urgent ? "#ff6b6b" : "#fff",
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: 1, color: "rgba(255,255,255,0.6)" }}>
            TIME
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* 일시정지 (우상단) */}
      <button
        type="button"
        onClick={onPause}
        aria-label="일시정지"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 20,
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(8,6,20,0.45)",
          backdropFilter: "blur(8px)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* pause 아이콘 */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <rect x="6" y="5" width="4" height="14" rx="1.5" />
          <rect x="14" y="5" width="4" height="14" rx="1.5" />
        </svg>
      </button>

      {/* 생명 (상단 중앙) */}
      <div
        style={{
          position: "absolute",
          top: 22,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          fontSize: 22,
          letterSpacing: 2,
        }}
      >
        {Array.from({ length: START_LIVES }, (_, i) => (
          <span key={i} style={{ opacity: i < lives ? 1 : 0.25 }}>
            ❤️
          </span>
        ))}
      </div>
    </>
  );
}

// 남은 초를 M:SS 로. 60초 → "1:00", 9초 → "0:09".
function formatTime(secs: number): string {
  const s = Math.max(0, secs);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}
