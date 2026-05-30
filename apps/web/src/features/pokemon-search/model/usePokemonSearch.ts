import { useMemo, useState } from "react";
import type { PokemonSummary } from "../../../entities/pokemon";
import { filterPokemonByName } from "./filterPokemon";

// 검색 비즈니스 훅: 쿼리 상태 + 필터링된 결과(파생). 뷰는 query/setQuery/result 만 쓴다.
export function usePokemonSearch(source: PokemonSummary[]) {
  const [query, setQuery] = useState("");
  const result = useMemo(
    () => filterPokemonByName(source, query),
    [source, query]
  );
  return { query, setQuery, result };
}
