// 순수 controlled input. 상태 소유는 호출자(훅)의 책임.
export function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="이름으로 검색 (현재 페이지 내)"
      style={{
        width: "100%",
        maxWidth: 320,
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid #ccc",
        fontSize: 14,
      }}
    />
  );
}
