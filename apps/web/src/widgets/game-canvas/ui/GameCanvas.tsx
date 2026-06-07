import { useEffect, useRef } from "react";
import "./gameCanvas.css";
import type { Fruit } from "../../../entities/fruit";
import type { Burst } from "../../../features/fruit-game";
import type { HandState } from "../../../features/hand-tracking";

// super(빨간 별) 꼬리 그라데이션 — 붉은색.
const SUPER_TRAIL =
  "linear-gradient(to top, rgba(255,59,59,0.9), rgba(255,59,59,0))";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  // 카메라 사용 여부 — false 면 비디오를 숨기고 그라데이션 배경만.
  cameraOn: boolean;
  fruits: Fruit[];
  bursts: Burst[];
  // 손 커서 표시용(없으면 미표시). 게임 루프와 별개로 부드럽게 갱신.
  handRef: React.RefObject<HandState | null>;
  // 지금 grab 이 득점 가능한 상태인지(1초 윈도우 유효). 노란색 표시 기준.
  grabScorableRef: React.RefObject<boolean>;
  // 클릭/탭으로 잡기 (정규화 좌표 전달).
  onTap: (x: number, y: number) => void;
}

// 순수 뷰: 카메라 + 떨어지는 과일 + 손 커서 + 터짐 연출을 그린다.
// 도메인 로직 없음 — props 로 받은 좌표만 렌더링.
export function GameCanvas({
  videoRef,
  cameraOn,
  fruits,
  bursts,
  handRef,
  grabScorableRef,
  onTap,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  // 손가락 끝 도형 4개(검지/중지/약지/소지).
  const tipRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 손 시각화는 리렌더 없이 매 프레임 DOM 만 갱신해 부드럽게.
  // 중앙(손바닥) 도형은 캐치 기준점, 끝 도형들은 grab 정도에 따라 중심으로 모인다.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const cur = cursorRef.current;
      const hand = handRef.current;
      if (!cur) return;
      if (!hand) {
        cur.style.opacity = "0";
        tipRefs.current.forEach((t) => t && (t.style.opacity = "0"));
        return;
      }
      // 노란색은 "득점 가능 상태"(grab 1초 윈도우 유효)에만 표시한다.
      // 쥐고 있어도 윈도우가 끝나면 흰색으로 돌아가 득점 불가를 명확히 알린다.
      const scorable = grabScorableRef.current;

      // 중앙 도형
      cur.style.opacity = "1";
      cur.style.left = `${hand.x * 100}%`;
      cur.style.top = `${hand.y * 100}%`;
      cur.style.transform = `translate(-50%, -50%) scale(${1 - hand.closeness * 0.25})`;
      cur.style.borderColor = scorable ? "#ffd23f" : "rgba(255,255,255,0.7)";
      cur.style.background = scorable
        ? "rgba(255,210,63,0.28)"
        : "rgba(255,255,255,0.08)";

      // 손가락 끝 도형: 항상 실제 손가락 끝(tip) 위치에 정확히 붙는다.
      // (중간 마디로 끌려가지 않도록 보간하지 않는다.)
      hand.tips.forEach((tip, i) => {
        const el = tipRefs.current[i];
        if (!el) return;
        el.style.opacity = "1";
        el.style.left = `${tip.x * 100}%`;
        el.style.top = `${tip.y * 100}%`;
        el.style.background = scorable
          ? "rgba(255,210,63,0.85)"
          : "rgba(255,255,255,0.6)";
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [handRef, grabScorableRef]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    onTap((e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height);
  };

  return (
    <div
      ref={wrapRef}
      onClick={handleClick}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {/* 카메라 프리뷰 (거울 모드). 항상 마운트해두고 표시만 토글. */}
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
          opacity: cameraOn ? 0.55 : 0,
          transition: "opacity 0.4s",
        }}
      />
      {/* 가독성용 어두운 오버레이 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(20,16,45,0.25), rgba(10,8,24,0.78))",
        }}
      />

      {/* 과일 — 직접 클릭/탭하면 그 위치로 잡기 시도(클릭 모드 정확도 향상) */}
      {fruits.map((f) => (
        <div
          key={f.id}
          className={f.popped ? "fg-fruit fg-fruit--pop" : "fg-fruit"}
          onClick={
            f.popped
              ? undefined
              : (e) => {
                  e.stopPropagation();
                  onTap(f.x, f.y);
                }
          }
          style={{
            left: `${f.x * 100}%`,
            top: `${f.y * 100}%`,
            // 화면 크기에 비례한 과일 크기(vmin 기준). radius*2 가 지름.
            fontSize: `${f.radius * 2 * 100}vmin`,
            pointerEvents: f.popped ? "none" : "auto",
            // 빨간 별(super)은 붉은 글로우로 즉시 식별.
            filter:
              f.tier === "super" && !f.popped
                ? "drop-shadow(0 0 10px #ff3b3b) drop-shadow(0 4px 10px rgba(0,0,0,0.45))"
                : undefined,
          }}
        >
          {f.tier !== "normal" && !f.popped && (
            <span
              className="fg-fruit__trail"
              style={f.tier === "super" ? { background: SUPER_TRAIL } : undefined}
            />
          )}
          {f.popped ? "💥" : f.emoji}
        </div>
      ))}

      {/* 점수 버스트 — x2 금색, x3 빨강 */}
      {bursts.map((b) => (
        <div
          key={b.id}
          className="fg-burst"
          style={{
            left: `${b.x * 100}%`,
            top: `${b.y * 100}%`,
            color:
              b.tier === "super" ? "#ff5b5b" : b.tier === "fast" ? "#ffd23f" : "#7CFFB2",
          }}
        >
          +{b.gained}
          {b.tier === "fast" && " ✨x2"}
          {b.tier === "super" && " 🔥x3"}
        </div>
      ))}

      {/* 손가락 끝 도형 (반투명, 쥘수록 중심으로 모임) */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          ref={(el) => {
            tipRefs.current[i] = el;
          }}
          className="fg-tip"
        />
      ))}

      {/* 손바닥(중앙) 커서 — 캐치 기준 도형 */}
      <div ref={cursorRef} className="fg-cursor" />
    </div>
  );
}
