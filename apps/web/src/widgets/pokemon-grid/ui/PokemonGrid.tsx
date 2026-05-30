import { PokemonCard, type PokemonSummary } from "../../../entities/pokemon";

// 순수 뷰 위젯: 받은 목록을 반응형 그리드로 배치. 데이터/상태를 소유하지 않는다.
export function PokemonGrid({ items }: { items: PokemonSummary[] }) {
  if (items.length === 0) {
    return (
      <p style={{ color: "#999", textAlign: "center" }}>결과가 없습니다.</p>
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      }}
    >
      {items.map((p) => (
        <PokemonCard key={p.id} pokemon={p} />
      ))}
    </div>
  );
}
