// 순수 뷰 프리미티브.
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div style={{ padding: 24, textAlign: "center", color: "#c0392b" }}>
      ⚠ {message}
    </div>
  );
}
