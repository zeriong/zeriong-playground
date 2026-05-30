import { useCallback, useEffect, useState } from "react";
import { fetchPokemonPage } from "./pokemonApi";
import type { PokemonSummary } from "./types";

interface State {
  items: PokemonSummary[];
  total: number;
  loading: boolean;
  error: string | null;
}

// 페이지 목록 조회 비즈니스 훅. 뷰는 page 만 넘기고 결과를 받는다.
export function usePokemonList(page: number) {
  const [state, setState] = useState<State>({
    items: [],
    total: 0,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { items, total } = await fetchPokemonPage(page);
      setState({ items, total, loading: false, error: null });
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : "Unknown error",
      }));
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: load };
}
