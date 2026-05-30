// 순수 뷰 프리미티브. 도메인 지식 없음.
export function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div style={{ padding: 24, textAlign: "center", color: "#888" }}>
      {label}
    </div>
  );
}
