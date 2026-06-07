import "./introScreen.css";
import { GameButton } from "../../../shared/ui/GameButton";

// 순수 뷰: 인트로. 큰 타이틀 + start/rank. 떠다니는 과일 장식.
export function IntroScreen({
  onStart,
  onRank,
}: {
  onStart: () => void;
  onRank: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        textAlign: "center",
        zIndex: 10,
      }}
    >
      {/* 배경 둥둥 과일 */}
      <div className="fg-intro-deco" aria-hidden>
        {["🍎", "🍊", "🍇", "🍓", "🍉", "🍌", "⭐"].map((e, i) => (
          <span key={i} className={`fg-float fg-float--${i}`}>
            {e}
          </span>
        ))}
      </div>

      <div style={{ fontSize: 64, marginBottom: 4 }} className="fg-bounce">
        🍎
      </div>
      <h1
        style={{
          margin: 0,
          fontSize: "clamp(36px, 9vw, 64px)",
          fontWeight: 900,
          letterSpacing: -1,
          background: "linear-gradient(135deg, #ff8a5b, #ffd23f, #ff6b6b)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          textShadow: "0 8px 30px rgba(255,107,107,0.25)",
        }}
      >
        과일잡기 게임!
      </h1>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, margin: "12px 0 36px" }}>
        손을 ✊ 쥐어 떨어지는 과일을 잡으세요 · ⭐ 별 x2 · 🔴 빨간 별 x3!
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "min(300px, 80vw)" }}>
        <GameButton variant="primary" onClick={onStart} style={{ fontSize: 20, padding: "18px" }}>
          ▶ 시작 (Start)
        </GameButton>
        <GameButton variant="secondary" onClick={onRank} style={{ fontSize: 18 }}>
          🏆 랭킹 (Rank)
        </GameButton>
      </div>
    </div>
  );
}
