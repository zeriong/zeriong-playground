import type { CSSProperties, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

// 게임 전반에서 쓰는 버튼 프리미티브. 도메인 지식 없음.
export function GameButton({
  children,
  onClick,
  variant = "primary",
  style,
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: Variant;
  style?: CSSProperties;
}) {
  const base: CSSProperties = {
    appearance: "none",
    border: "none",
    borderRadius: 14,
    padding: "14px 22px",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.12s, filter 0.12s, box-shadow 0.12s",
    fontFamily: "inherit",
  };
  const variants: Record<Variant, CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, #ff6b6b, #ffa14a)",
      color: "#fff",
      boxShadow: "0 8px 20px rgba(255,107,107,0.4)",
    },
    secondary: {
      background: "rgba(255,255,255,0.12)",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.25)",
    },
    ghost: {
      background: "transparent",
      color: "rgba(255,255,255,0.7)",
    },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}
