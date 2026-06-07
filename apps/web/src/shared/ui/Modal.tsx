import type { ReactNode } from "react";

// 게임 오버레이 모달 프리미티브. 어두운 백드롭 + 카드. 도메인 지식 없음.
export function Modal({
  title,
  children,
  footer,
}: {
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(8,6,20,0.6)",
        backdropFilter: "blur(6px)",
        zIndex: 30,
        padding: 20,
      }}
    >
      <div
        style={{
          width: "min(420px, 92vw)",
          background: "linear-gradient(160deg, #241c45, #181230)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 24,
          padding: "28px 24px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          textAlign: "center",
          color: "#fff",
        }}
      >
        {title && (
          <h2 style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 800 }}>
            {title}
          </h2>
        )}
        {children && (
          <div style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.6, fontSize: 15 }}>
            {children}
          </div>
        )}
        {footer && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 22,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
