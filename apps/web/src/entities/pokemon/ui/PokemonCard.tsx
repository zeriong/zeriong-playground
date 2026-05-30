import type { PokemonSummary } from "../model/types";

// 순수 프레젠테이션. props 로 받은 도메인 모델만 그린다. 데이터 출처를 모른다.
export function PokemonCard({ pokemon }: { pokemon: PokemonSummary }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 12,
        textAlign: "center",
        background: "#fff",
      }}
    >
      <img
        src={pokemon.imageUrl}
        alt={pokemon.name}
        loading="lazy"
        width={96}
        height={96}
        style={{ objectFit: "contain" }}
      />
      <div style={{ fontSize: 12, color: "#999" }}>
        #{String(pokemon.id).padStart(3, "0")}
      </div>
      <div style={{ textTransform: "capitalize", fontWeight: 600 }}>
        {pokemon.name}
      </div>
    </div>
  );
}
