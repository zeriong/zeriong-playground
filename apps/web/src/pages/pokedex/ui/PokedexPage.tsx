import { usePokemonList } from "../../../entities/pokemon";
import { SearchInput, usePokemonSearch } from "../../../features/pokemon-search";
import { PokemonGrid } from "../../../widgets/pokemon-grid";
import { PAGE_SIZE } from "../../../shared/config";
import { Spinner } from "../../../shared/ui/Spinner";
import { ErrorMessage } from "../../../shared/ui/ErrorMessage";
import { usePagination } from "../model/usePagination";
import { PaginationControls } from "./PaginationControls";

// 페이지는 "조합"만 한다: 비즈니스 훅에서 데이터/상태를 받아 뷰 컴포넌트에 흘려보낸다.
// 이 파일에는 fetch/필터 같은 비즈니스 로직이 없다.
export function PokedexPage() {
  const pager = usePagination();
  const { items, total, loading, error } = usePokemonList(pager.page);
  const { query, setQuery, result } = usePokemonSearch(items);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main
      style={{
        fontFamily: "sans-serif",
        padding: 24,
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <h1>Pokédex</h1>
      <p style={{ color: "#888" }}>
        PokeAPI · FSD 아키텍처 · business/view 로직 분리 예제
      </p>

      <div style={{ margin: "16px 0" }}>
        <SearchInput value={query} onChange={setQuery} />
      </div>

      {error && <ErrorMessage message={error} />}
      {loading && <Spinner />}
      {!loading && !error && <PokemonGrid items={result} />}

      {!loading && !error && (
        <PaginationControls
          page={pager.page}
          canPrev={pager.canPrev}
          canNext={pager.page < totalPages - 1}
          onPrev={pager.prev}
          onNext={pager.next}
        />
      )}
    </main>
  );
}
