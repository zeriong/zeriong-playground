import type { PokemonSummary } from "../../../entities/pokemon";

// 순수 비즈니스 로직: 이름 부분일치 필터. React 무관, 테스트 용이.
export function filterPokemonByName(
  list: PokemonSummary[],
  query: string
): PokemonSummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((p) => p.name.toLowerCase().includes(q));
}
